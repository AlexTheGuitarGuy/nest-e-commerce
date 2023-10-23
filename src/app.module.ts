import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['PG_HOST'] || 'localhost',
      port: +(process.env['PG_PORT'] || 5432),
      username: process.env['PG_USERNAME'] || 'postgres',
      password: process.env['PG_PASSWORD'] || 'postgres',
      entities: [__dirname + '/../**/*.entity.js'],
      database: process.env['PG_DATABASE'] || 'postgres',
      synchronize: true,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
