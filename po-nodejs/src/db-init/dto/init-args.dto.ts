/* eslint-disable @typescript-eslint/camelcase */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsLocale, IsUrl, IsEmail } from 'class-validator';
import { InitArgs } from '@/sequelize-datasources/interfaces/init-args.interface';

export class InitArgsDto implements Omit<InitArgs, 'siteUrl'> {
  @ApiProperty({ description: 'Site title' })
  @IsNotEmpty({ message: 'field $property is required' })
  title!: string;

  @ApiProperty({ description: 'Admin signin password' })
  @IsNotEmpty({ message: 'field $property is required' })
  @MinLength(6, { message: 'field $property must be longer than or equal to $constraint1 characters' })
  password!: string;

  @ApiProperty({ description: 'Site default using language' })
  @IsNotEmpty({ message: 'field $property is required' })
  @IsLocale({ message: 'field $property must be a language locale' })
  locale!: string;

  @ApiProperty({ description: 'Home url' })
  @IsNotEmpty({ message: 'field $property is required' })
  @IsUrl({ require_tld: false }, { message: 'field $property must be a URL address' })
  homeUrl!: string;

  @ApiProperty({ description: 'Admin email' })
  @IsNotEmpty({ message: 'field $property is required' })
  @IsEmail({}, { message: 'field $property must be an email' })
  email!: string;
}
