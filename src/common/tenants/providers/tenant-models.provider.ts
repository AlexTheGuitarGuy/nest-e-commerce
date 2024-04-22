import { Connection } from 'mongoose';
import { Payment, PaymentSchema } from 'src/orders/entities/payment.schema';

export enum TenantModels {
  paymentModel = 'PAYMENT_MODEL',
}

export const tenantModels = {
  paymentModel: {
    provide: TenantModels.paymentModel,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Payment.name, PaymentSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
};
