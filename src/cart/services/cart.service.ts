import { concatMap, map, Observable, of } from 'rxjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisClientService } from 'src/core/database/redis-client/services/redis-client.service';
import { UsersService } from 'src/users/services/users.service';
import { CartDto } from '../dto/cart.dto';
import { ProductsService } from 'src/products/services/products.service';
import { ProductDto } from 'src/products/dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly _redisClientService: RedisClientService,
    private readonly _usersService: UsersService,
    private readonly _productsService: ProductsService,
  ) {}

  private _getCart(
    userId: string,
    productId?: string,
  ): Observable<CartDto & { product?: ProductDto }> {
    return this._redisClientService.get(`cart:${userId}`).pipe(
      concatMap((cartItems) => {
        const cartItemsParsed = JSON.parse(cartItems || '[]');
        return productId
          ? this._productsService
              .findOneOrThrow({ where: { id: productId } })
              .pipe(map((product) => ({ cartItems: cartItemsParsed, product })))
          : of({ cartItems: cartItemsParsed, product: undefined });
      }),
      concatMap(({ cartItems, product }) =>
        this._usersService
          .findOneOrThrow({
            where: { id: userId },
          })
          .pipe(
            map((user) => plainToInstance(UserDto, user)),
            map((user) => ({ user, cartItems, product })),
          ),
      ),
    );
  }

  updateCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Observable<'OK'> {
    return this._getCart(userId, productId).pipe(
      concatMap(({ cartItems, product }) => {
        const cartItem = cartItems.find(
          (item) => item.product.id === productId,
        );

        if (!cartItem) {
          return this._redisClientService.set(
            `cart:${userId}`,
            JSON.stringify([...cartItems, { product, quantity }]),
          );
        }

        cartItem.quantity = quantity;

        return this._redisClientService.set(
          `cart:${userId}`,
          JSON.stringify(cartItems),
        );
      }),
    );
  }

  viewCart(userId: string): Observable<CartDto> {
    return this._getCart(userId).pipe(
      map(({ cartItems, user }) =>
        plainToInstance(CartDto, {
          user,
          cartItems,
        }),
      ),
    );
  }

  deleteFromCart(userId: string, productId?: string) {
    return this._getCart(userId, productId).pipe(
      concatMap(({ cartItems }) => {
        if (!productId) {
          if (!cartItems.length)
            throw new BadRequestException('Cart is already empty');

          return this._redisClientService.del(`cart:${userId}`);
        }

        const cartItem = cartItems.find(
          (item) => item.product.id === productId,
        );

        if (!cartItem) throw new NotFoundException('Product not found in cart');

        const filteredCart = cartItems.filter(
          (item) => item.product.id !== productId,
        );

        return this._redisClientService.set(
          `cart:${userId}`,
          JSON.stringify(filteredCart),
        );
      }),
    );
  }
}
