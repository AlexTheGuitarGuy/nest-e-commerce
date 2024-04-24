import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import { ProductsService } from '../services/products.service';
import { Role } from 'src/common/enums/role.enum';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class SellerIntegrityGuard implements CanActivate {
  constructor(private readonly _productsService: ProductsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const productId = context.switchToHttp().getRequest().params['id'];
    const updateProductDto = context.switchToHttp().getRequest().body as
      | UpdateProductDto
      | undefined;
    const user = context.switchToHttp().getRequest().user;
    return this._productsService
      .findOneOrThrow({
        where: { id: productId },
        relations: { seller: true },
      })
      .pipe(
        tap((product) => {
          if (user.role !== Role.Admin) {
            if (product?.seller.id !== user.id)
              throw new ForbiddenException(
                'You cannot change a product that is not yours',
              );
            if (updateProductDto && 'seller' in updateProductDto)
              throw new ForbiddenException(
                'You cannot change the seller of a product',
              );
          }
        }),
        map(() => true),
      );
  }
}
