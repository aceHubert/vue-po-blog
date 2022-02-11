import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty({ message: 'field $property is required' })
  username!: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({ message: 'field $property is required' })
  @MinLength(6, { message: 'field $property must be longer than or equal to $constraint1 characters' })
  password!: string;

  @ApiProperty({ description: 'Signin device' })
  @IsNotEmpty({ message: 'field device is required' })
  device!: string;
}
