import { IsNotEmpty, MinLength, IsLocale, IsUrl, IsEmail } from 'class-validator';

export class InitArgs {
  @IsNotEmpty({ message: 'field $property is required' })
  title!: string;

  @IsNotEmpty({ message: 'field $property is required' })
  @MinLength(6, { message: 'field $property must be longer than or equal to $constraint1 characters' })
  password!: string;

  @IsNotEmpty({ message: 'field $property is required' })
  @IsLocale({ message: 'field $property must be a language locale' })
  locale!: string;

  @IsNotEmpty({ message: 'field $property is required' })
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: 'field $property must be a URL address' })
  siteUrl!: string;

  @IsNotEmpty({ message: 'field $property is required' })
  @IsEmail({}, { message: 'field $property must be an email' })
  email!: string;
}
