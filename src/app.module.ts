import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
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
      entities: [],
      database: process.env['PG_DATABASE'] || 'postgres',
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
