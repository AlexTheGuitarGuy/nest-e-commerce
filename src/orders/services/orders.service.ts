import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/services/cart.service';
import { concatMap, from, of, map, tap, Observable } from 'rxjs';
import * as paypal from 'paypal-rest-sdk';
import { Payment } from '../entities/payment.schema';
import { Model } from 'mongoose';
import { UserDto } from 'src/users/dto/user.dto';
import { EmailService } from 'src/email/services/email.service';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';
import { TenantModels } from 'src/common/tenants/providers/tenant-models.provider';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(TenantModels.paymentModel)
    private readonly _paymentModel: Model<Payment>,
    private readonly _cartService: CartService,
    private readonly _emailService: EmailService,
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  public createPayment(user: UserDto) {
    return this._cartService.viewCart(user.id).pipe(
      concatMap((cart) => {
        if (!cart.cartItems.length) throw new BadRequestException('Empty cart');

        const paypalItems = cart.cartItems.map((item) => ({
          name: item.product.name,
          sku: item.product.id.toString(),
          price: (item.product.price / 100).toString(),
          currency: 'USD',
          quantity: item.quantity,
        }));

        const paypalPayment = {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          redirect_urls: {
            return_url: `${process.env.PAYPAL_PAYMENT_REDIRECT_URL}?shouldContinue=true`,
            cancel_url: `${process.env.PAYPAL_PAYMENT_REDIRECT_URL}?shouldContinue=false`,
          },
          transactions: [
            {
              item_list: {
                items: paypalItems,
              },
              amount: {
                currency: 'USD',
                total: cart.cartItems
                  .reduce(
                    (acc, item) =>
                      acc + (item.product.price / 100) * item.quantity,
                    0,
                  )
                  .toString(),
              },
              description: 'This is the payment description.',
            },
          ],
        };

        return of(paypalPayment);
      }),
      concatMap((paypalPayment) =>
        from(
          new Promise<paypal.PaymentResponse>((resolve, reject) => {
            paypal.payment.create(paypalPayment, (err, payment) => {
              if (err) reject(err);
              else resolve(payment);
            });
          }),
        ),
      ),
      concatMap((payment) => {
        const newPayment = new this._paymentModel({
          paymentResponse: {
            ...payment,
            payer: {
              ...payment.payer,
              payer_info: { payer_id: user.id },
            },
          },
        });
        return from(newPayment.save()).pipe(
          map(() => newPayment.paymentResponse),
        );
      }),
    );
  }

  public executePayment(user: UserDto, token: string) {
    const { paymentId, payerId } =
      this._emailConfirmationService.decodePaypalOrderToken(token);
    return from(
      this._paymentModel.findOne({
        'paymentResponse.id': paymentId,
      }),
    ).pipe(
      tap((payment) => {
        if (payment?.paymentResponse.state === 'approved')
          throw new BadRequestException('Payment already executed');
        if (payment?.paymentResponse.state === 'cancelled')
          throw new BadRequestException('Payment already cancelled');
      }),
      concatMap(
        () =>
          new Promise<paypal.PaymentResponse>((resolve, reject) => {
            paypal.payment.execute(
              paymentId,
              { payer_id: payerId },
              (err, payment) => {
                if (err) reject(err);
                else resolve(payment);
              },
            );
          }),
      ),
      concatMap((payment) => {
        return from(
          this._paymentModel.findOneAndUpdate(
            { 'paymentResponse.id': paymentId },
            { $set: { paymentResponse: payment } },
          ),
        ).pipe(map(() => payment));
      }),
      map((payment) => {
        return this._emailService
          .sendEmail({
            to: user.email,
            subject: 'Payment successful',
            text: `
            Your payment was successful.\n
            Payment ID: ${paymentId}\n
            Payer ID: ${payerId}\n
            Amount: ${payment.transactions[0].amount.total}\n
            Currency: ${payment.transactions[0].amount.currency}\n
            Items: ${payment.transactions[0].item_list?.items
              .map((item) => `${item.name} x ${item.quantity}`)
              .join(', ')}\n
            `,
          })
          .pipe(map((payment) => payment));
      }),
      concatMap((payment) =>
        this._cartService.deleteFromCart(user.id).pipe(map(() => payment)),
      ),
    );
  }

  public cancelPayment(user: UserDto, token: string) {
    const { paymentId, payerId } =
      this._emailConfirmationService.decodePaypalOrderToken(token);
    return from(
      this._paymentModel.findOne({
        'paymentResponse.id': paymentId,
      }),
    ).pipe(
      concatMap((payment) => {
        if (!payment) throw new BadRequestException('Payment not found');
        if (payment.paymentResponse.state === 'approved')
          throw new BadRequestException('Payment already executed');
        if (payment.paymentResponse.state === 'cancelled')
          throw new BadRequestException('Payment already cancelled');

        return from(
          this._paymentModel.updateOne(
            { 'paymentResponse.id': paymentId },
            { $set: { 'paymentResponse.state': 'cancelled' } },
          ),
        ).pipe(
          map(() => {
            const plainPayment = payment.toObject();
            return {
              ...plainPayment,
              paymentResponse: {
                ...plainPayment.paymentResponse,
                state: 'cancelled',
              },
            };
          }),
        );
      }),
      map((payment) => {
        return this._emailService.sendEmail({
          to: user.email,
          subject: 'Payment cancelled',
          text: `
            Your payment was cancelled.\n
            Payment ID: ${paymentId}\n
            Payer ID: ${payerId}\n
            Amount: ${payment.paymentResponse.transactions[0].amount.total}\n
            Currency: ${
              payment.paymentResponse.transactions[0].amount.currency
            }\n
            Items: ${payment.paymentResponse.transactions[0].item_list?.items
              .map((item) => `${item.name} x ${item.quantity}`)
              .join(', ')}\n
            `,
        });
      }),
    );
  }

  public getOrderHistory(
    payerId?: string,
  ): Observable<{ count: number; payments: Payment[] }> {
    return from(
      this._paymentModel.find(
        payerId
          ? {
              'paymentResponse.payer.payer_info.payer_id': payerId,
            }
          : {},
      ),
    ).pipe(
      map((payments) => ({
        count: (payments as Payment[]).length,
        payments: payments as Payment[],
      })),
    );
  }
}
