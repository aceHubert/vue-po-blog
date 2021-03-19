import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required!' })
  readonly username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'The password length must not be less than 6 characters!' })
  readonly password!: string;
}
