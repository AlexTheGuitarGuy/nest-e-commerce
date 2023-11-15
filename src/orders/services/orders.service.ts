import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/services/cart.service';
import { concatMap, from, of, map, tap, Observable } from 'rxjs';
import * as paypal from 'paypal-rest-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayerEntity } from '../entities/payer.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from '../entities/payment.schema';
import { Model } from 'mongoose';
import { UserDto } from 'src/users/dto/user.dto';
import { environment } from 'src/environments/environment';
import { EmailService } from 'src/email/services/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(PayerEntity)
    private readonly _payerRepository: Repository<PayerEntity>,
    @InjectModel(Payment.name)
    private readonly _paymentSchema: Model<Payment>,
    private readonly _cartService: CartService,
    private readonly _emailService: EmailService,
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
            return_url: `${environment.PAYPAL_PAYMENT_REDIRECT_URL}?shouldContinue=true`,
            cancel_url: `${environment.PAYPAL_PAYMENT_REDIRECT_URL}?shouldContinue=false`,
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
      concatMap((payment) =>
        from(
          this._payerRepository.findOne({
            where: { user },
          }),
        ).pipe(map((payer) => ({ payer, payment }))),
      ),
      concatMap(({ payer, payment }) => {
        if (!payer) {
          return from(this._payerRepository.save({ user })).pipe(
            map(() => payment),
          );
        }

        return of(payment);
      }),
      concatMap((payment) => {
        const newPayment = new this._paymentSchema({
          paymentResponse: {
            ...payment,
            payer: {
              ...payment.payer,
              payer_info: { payer_id: user.payer?.payerId },
            },
          },
        });
        return from(newPayment.save()).pipe(
          map(() => newPayment.paymentResponse),
        );
      }),
    );
  }

  public paypalEmail(
    user: UserDto,
    shouldContinue: boolean,
    paymentId?: string,
    payerId?: string,
  ) {
    return shouldContinue
      ? this._emailService.sendEmail({
          to: user.email,
          subject: 'Payment confirmation',
          text: `Please confirm your payment before proceeding.\n
      If you have already confirmed your payment, please ignore this email.\n
      Payment ID: ${paymentId}\n
      Payer ID: ${payerId}\n
      Click on the link to confirm your payment: ${environment.PAYPAL_CONFIRM_URL}?paymentId=${paymentId}&PayerID=${payerId}\n
      Click on the link to cancel your payment: ${environment.PAYPAL_CANCEL_URL}?paymentId=${paymentId}&PayerID=${payerId}\n
      `,
        })
      : this._emailService.sendEmail({
          to: user.email,
          subject: 'Payment cancelation',
          text: `Your payment has been cancelled.`,
        });
  }

  public executePayment(user: UserDto, paymentId: string, payerId: string) {
    return from(
      this._paymentSchema.findOne({
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
      concatMap((payment) =>
        from(
          this._payerRepository.findOne({
            where: { user },
          }),
        ).pipe(map((payer) => ({ payer, payment }))),
      ),
      concatMap(({ payer, payment }) => {
        if (!payer) {
          return from(this._payerRepository.save({ user })).pipe(
            map(() => payment),
          );
        } else if (!payer.payerId) {
          return from(
            this._payerRepository.update(
              { id: user.payer?.id },
              { payerId: (payment.payer as any).payer_info.payer_id },
            ),
          ).pipe(map(() => payment));
        }

        return of(payment);
      }),
      concatMap((payment) => {
        return from(
          this._paymentSchema.findOneAndUpdate(
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

  public cancelPayment(user: UserDto, paymentId: string, payerId: string) {
    return from(
      this._paymentSchema.findOne({
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
          this._paymentSchema.updateOne(
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
    user: UserDto,
  ): Observable<{ count: number; payments: Payment[] }> {
    if (!user.payer?.payerId) return of({ count: 0, payments: [] });

    return from(
      this._paymentSchema.find({
        'paymentResponse.payer.payer_info.payer_id': user.payer?.payerId,
      }),
    ).pipe(
      map((payments) => ({
        count: (payments as Payment[]).length,
        payments: payments as Payment[],
      })),
    );
  }
}
