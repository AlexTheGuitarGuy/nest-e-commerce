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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(PayerEntity)
    private readonly _payerRepository: Repository<PayerEntity>,
    @InjectModel(Payment.name)
    private readonly _paymentSchema: Model<Payment>,
    private readonly _cartService: CartService,
  ) {}

  public createPayment(user: UserDto, returnUrl: string, cancelUrl: string) {
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
            return_url: returnUrl,
            cancel_url: cancelUrl,
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
          paymentResponse: payment,
        });
        return from(newPayment.save()).pipe(map(() => payment));
      }),
    );
  }

  public executePayment(user: UserDto, paymentId: string, payerId: string) {
    return from(
      new Promise<paypal.PaymentResponse>((resolve, reject) => {
        paypal.payment.get(paymentId, (err, payment) => {
          if (err) reject(err);
          else resolve(payment);
        });
      }),
    ).pipe(
      tap((payment) => {
        if (payment.state !== 'created')
          throw new BadRequestException('Payment already executed');
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
          payer.payerId = payerId;
          return from(this._payerRepository.save(payer)).pipe(
            map(() => payment),
          );
        }

        return of(payment);
      }),
      concatMap((payment) => {
        const updatedPayment = new this._paymentSchema({
          paymentResponse: payment,
        });
        return from(
          this._paymentSchema.findOneAndUpdate(
            { 'paymentResponse.id': paymentId },
            { paymentResponse: updatedPayment.paymentResponse },
            { new: true },
          ),
        ).pipe(map(() => payment));
      }),
      concatMap((payment) =>
        this._cartService.deleteFromCart(user.id).pipe(map(() => payment)),
      ),
    );
  }

  public getUserPaymentHistory(user: UserDto): Observable<any> {
    console.log('user', user);

    return from(
      this._paymentSchema.find({
        'paymentResponse.payer.payer_info.payer_id': user.payer?.payerId,
      }),
    ).pipe(
      tap((payments) => {
        console.log('payments', payments);
      }),
    );
  }
}
