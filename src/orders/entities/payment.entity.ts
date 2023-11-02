import * as paypal from 'paypal-rest-sdk';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ database: 'mongodb' })
export class PaymentEntity {
  @ObjectIdColumn()
  id!: number;

  @Column('json')
  paymentResponse!: paypal.PaymentResponse;
}
