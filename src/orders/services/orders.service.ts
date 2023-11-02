import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from 'src/cart/services/cart.service';
import { concatMap, from, of, map, Observable } from 'rxjs';
import * as paypal from 'paypal-rest-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayerEntity } from '../entities/payer.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(PayerEntity)
    private readonly _payerRepository: Repository<PayerEntity>,
    private readonly _cartService: CartService,
  ) {}

  public createPayment(userId: number, returnUrl: string, cancelUrl: string) {
    return this._cartService.viewCart(userId).pipe(
      concatMap((cart) => {
        if (!cart.cartItems.length) throw new BadRequestException('Empty cart');

        const paypalItems = cart.cartItems.map((item) => ({
          name: item.product.name,
          sku: item.product.id.toString(),
          price: (item.product.price * 100).toString(),
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
                      acc + item.product.price * 100 * item.quantity,
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
      concatMap((paypalPayment) => {
        return from(
          new Promise((resolve, reject) => {
            paypal.payment.create(paypalPayment, (err, payment) => {
              if (err) reject(err);
              else {
                const redirectUrl =
                  payment.links?.find((link) => link.rel === 'approval_url')
                    ?.href || '';
                resolve(redirectUrl);
              }
            });
          }),
        );
      }),
    );
  }

  public executePayment(userId: number, paymentId: string, payerId: string) {
    return from(
      new Promise((resolve, reject) => {
        paypal.payment.execute(
          paymentId,
          { payer_id: payerId },
          (err, payment) => {
            if (err) reject(err);
            else resolve(payment);
          },
        );
      }),
    ).pipe(
      concatMap((result) =>
        this._cartService.deleteFromCart(userId).pipe(map(() => result)),
      ),
    );
  }

  public getPayerByPayerId(payerId: string): Observable<PayerEntity> {
    return from(this._payerRepository.findOne({ where: { payerId } })).pipe(
      map((payer) => {
        if (!payer) {
          throw new NotFoundException(`Payer with id ${payerId} not found`);
        }
        return payer;
      }),
    );
  }
}
