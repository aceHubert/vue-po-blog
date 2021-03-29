import { PipeTransform, Injectable } from '@nestjs/common';
import { UserInputError } from '@/common/utils/errors.utils';

import { isEmail } from 'class-validator';

@Injectable()
export class IsEmailPipe implements PipeTransform {
  constructor(private options?: Parameters<typeof isEmail>[1]) {}

  transform(value: any) {
    if (!(value && isEmail(value, this.options))) {
      throw new UserInputError('Email format is incorrect!');
    }
    return value;
  }
}
