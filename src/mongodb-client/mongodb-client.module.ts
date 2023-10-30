import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb+srv://Alex:xIXuBfdZGfjM4TQG@nest-e-commerce.im51qje.mongodb.net/?retryWrites=true&w=majority',
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      synchronize: true,
      logging: true,
    }),
  ],
})
export class MongodbClientModule {}
