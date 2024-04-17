import { Connection} from 'mongoose';
import { Payment, PaymentSchema } from 'src/orders/entities/payment.schema';

export const tenantModels = {
  paymentModel: {
    provide: 'PAYMENT_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Payment.name, PaymentSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
};
