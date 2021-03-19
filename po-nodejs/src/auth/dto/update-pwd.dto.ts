import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePwdDto {
  @IsString()
  @IsNotEmpty({ message: 'Old password is required!' })
  @MinLength(6, { message: 'The old password length must not be less than 6 characters!' })
  readonly oldPwd!: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required!' })
  @MinLength(6, { message: 'The new password length must not be less than 6 characters!' })
  readonly newPwd!: string;
}
