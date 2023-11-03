import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paypal from 'paypal-rest-sdk';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema()
export class Payment {
  @Prop({ required: true, type: JSON })
  paymentResponse!: paypal.PaymentResponse;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
