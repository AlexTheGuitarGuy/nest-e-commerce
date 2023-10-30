import { switchMap, map, Observable, of } from 'rxjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisClientService } from 'src/redis-client/services/redis-client.service';
import { UsersService } from 'src/users/services/users.service';
import { CartDto } from '../dto/cart.dto';
import { ProductsService } from 'src/products/services/products.service';

@Injectable()
export class CartService {
  constructor(
    private readonly _redisClientService: RedisClientService,
    private readonly _usersService: UsersService,
    private readonly _productsService: ProductsService,
  ) {}

  private _getCart(userId: number, productId?: number): Observable<CartDto> {
    return this._redisClientService.get(`cart:${userId}`).pipe(
      switchMap((cartItems) =>
        productId
          ? this._productsService
              .findOneById(productId, {}, {})
              .pipe(map(() => cartItems))
          : of(cartItems),
      ),
      switchMap((cartItems) =>
        this._usersService
          .findOneById(userId)
          .pipe(map((user) => ({ user, cartItems }))),
      ),
      map(({ user, cartItems }) => {
        if (!cartItems) return { user, cartItems: [] };
        return {
          user,
          cartItems: JSON.parse(cartItems),
        };
      }),
    );
  }

  updateCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Observable<'OK'> {
    return this._getCart(userId, productId).pipe(
      switchMap(({ cartItems }) => {
        const product = cartItems.find((item) => item.productId === productId);

        if (!product) {
          return this._redisClientService.set(
            `cart:${userId}`,
            JSON.stringify([...cartItems, { productId, quantity }]),
          );
        }

        product.quantity = quantity;

        return this._redisClientService.set(
          `cart:${userId}`,
          JSON.stringify(cartItems),
        );
      }),
    );
  }

  viewCart(userId: number): Observable<CartDto> {
    return this._getCart(userId);
  }

  deleteFromCart(userId: number, productId?: number) {
    return this._getCart(userId, productId).pipe(
      switchMap(({ cartItems }) => {
        if (!productId) {
          if (!cartItems.length)
            throw new BadRequestException('Cart is already empty');

          return this._redisClientService.del(`cart:${userId}`);
        }

        const product = cartItems.find((item) => item.productId === productId);

        if (!product) throw new NotFoundException('Product not found in cart');

        const filteredCart = cartItems.filter(
          (item) => item.productId !== productId,
        );

        return this._redisClientService.set(
          `cart:${userId}`,
          JSON.stringify(filteredCart),
        );
      }),
    );
  }
}
