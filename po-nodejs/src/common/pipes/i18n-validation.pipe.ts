import { iterate } from 'iterare';
import { snakeCase } from 'lodash';
import {
  Logger,
  PipeTransform,
  ValidationPipe,
  ValidationError,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

/**
 * ValidationPipe Validation error message 多语言
 * i18n key 格式为：validator.[[snakeCase(target.name)].]?.[snakeCase(property)].[property(message)]
 * @param i18n I18nRequestScopeService
 */

@Injectable()
export class I18nValidationPipe implements PipeTransform<any> {
  protected readonly logger = new Logger('I18nValidationPipe');
  private validationPipe!: ValidationPipe;

  constructor(private readonly i18n: I18nService) {
    this.validationPipe = new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: this.createExceptionFactory(),
    });
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.validationPipe.transform(value, metadata);
  }

  createExceptionFactory() {
    return async (validationErrors: ValidationError[] = []) => {
      const errors = await this.flattenValidationErrors(validationErrors);
      return new BadRequestException(errors);
    };
  }

  flattenValidationErrors(validationErrors: ValidationError[]): Promise<string[]> {
    return Promise.all(
      iterate(validationErrors)
        .map((error) => this.mapChildrenToValidationErrors(error))
        .flatten()
        .filter((item) => !!item.constraints)
        .map((item) => {
          return Object.keys(item.constraints!).map(async (validateKey) => {
            const i18nKey = `validator.${item.target ? snakeCase(item.target!.constructor.name) + '.' : ''}${snakeCase(
              item.property,
            )}.${snakeCase(validateKey)}`;
            this.logger.debug(i18nKey);
            const translate = await this.i18n!.t(i18nKey);
            return translate === i18nKey ? item.constraints![validateKey] : translate;
          });
        })
        .flatten()
        .toArray(),
    );
  }

  mapChildrenToValidationErrors(error: ValidationError, parentPath?: string): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }
    const validationErrors = [];
    parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(...this.mapChildrenToValidationErrors(item, parentPath));
      }
      validationErrors.push(this.prependConstraintsWithParentProp(parentPath, item));
    }
    return validationErrors;
  }

  prependConstraintsWithParentProp(parentPath: string, error: ValidationError): ValidationError {
    const constraints: Dictionary<string> = {};
    for (const key in error.constraints) {
      constraints[key] = `${parentPath}.${error.constraints[key]}`;
    }
    return {
      ...error,
      constraints,
    };
  }
}
