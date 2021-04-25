import { IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty({ message: 'field $property is required' })
  username!: string;

  @IsNotEmpty({ message: 'field $property is required' })
  @MinLength(6, { message: 'field $property must be longer than or equal to $constraint1 characters' })
  password!: string;

  @IsNotEmpty({ message: 'field device is required' })
  device!: string;
}
