import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Return URL is required.' })
  @IsUrl(undefined, { message: 'Return URL is not valid.' })
  returnUrl!: string;

  @IsNotEmpty({ message: 'Cancel URL is required.' })
  @IsUrl(undefined, { message: 'Return URL is not valid.' })
  cancelUrl!: string;
}
