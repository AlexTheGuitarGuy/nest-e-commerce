import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { Observable, of, from, switchMap, map } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';
import { CartDto } from '../dto/cart.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly _cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly _cartItemRepository: Repository<CartItemEntity>,
    private readonly _usersService: UsersService,
  ) {}

  private _getCart(userId: number): Observable<CartDto> {
    return from(
      this._cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.product', 'user'],
      }),
    ).pipe(
      switchMap((cart) => {
        if (!cart) {
          return this._usersService
            .findOneById(userId)
            .pipe(
              switchMap((user) =>
                this._cartRepository.save({ cartItems: [], user }),
              ),
            );
        }
        return of(cart);
      }),
      map((cart) => plainToInstance(CartDto, cart)),
    );
  }

  addToCart(userId: number, productId: number, quantity: number) {
    return this._getCart(userId).pipe(
      switchMap((cart) =>
        this._cartItemRepository.save({
          cart,
          product: { id: productId },
          quantity,
        }),
      ),
      map(() => void 0),
    );
  }

  viewCart(userId: number): Observable<CartDto> {
    return this._getCart(userId);
  }
}
