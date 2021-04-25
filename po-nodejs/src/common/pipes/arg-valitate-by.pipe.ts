import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface ValidateByPipeOptions<Args extends any[] = []> {
  validate: (value: unknown, ...args: Args) => boolean;
  args: Args;
  message?: string | (() => string | Promise<string>);
}

/**
 * 验证单个参数
 */
@Injectable()
export class ArgValidateByPipe<Args extends any[]> implements PipeTransform<any> {
  protected validate!: (value: unknown, ...args: Args) => boolean;
  protected args!: Args;
  protected message: string | (() => string | Promise<string>);

  constructor(readonly options: ValidateByPipeOptions<Args>) {
    this.validate = options.validate;
    this.args = options.args;
    this.message = options.message || 'validate error';
  }

  async transform(value: unknown) {
    // @ts-ignore
    if (!this.validate.apply(null, [value, ...this.args])) {
      const message = typeof this.message === 'string' ? this.message : await this.message();
      throw new BadRequestException(message);
    }
    return value;
  }
}
