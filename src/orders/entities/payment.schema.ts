import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';
import * as paypal from 'paypal-rest-sdk';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema()
export class Payment extends Document {
  @Prop({ required: true, type: JSON })
  paymentResponse!: paypal.PaymentResponse;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
