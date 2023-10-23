import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductEntity } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { ImageEntity } from './entities/image.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { ProductsService } from './services/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([ProductEntity, UserEntity, ImageEntity]),
    MinioClientModule,
  ],
})
export class ProductsModule {}
