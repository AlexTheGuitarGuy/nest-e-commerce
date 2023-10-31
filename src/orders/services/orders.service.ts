import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/services/cart.service';
import { concatMap, of } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(private readonly _cartService: CartService) {}

  public placeOrder(userId: number) {
    return this._cartService.viewCart(userId).pipe(
      concatMap((cart) => {
        if (!cart.cartItems.length) throw new BadRequestException('Empty cart');
        console.log('cart.cartItems', cart.cartItems);

        // return this._cartService.deleteFromCart(userId);
        return of(void 0);
      }),
    );
  }
}
