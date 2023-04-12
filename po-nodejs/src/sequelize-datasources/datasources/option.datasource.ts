import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { UserCapability } from '@/common/utils/user-capability.util';
import { ValidationError } from '@/common/utils/errors.util';
import { BaseDataSource } from './base.datasource';

// Types
import { OptionModel, OptionArgs, NewOptionInput, UpdateOptionInput } from '../interfaces/option.interface';

@Injectable()
export class OptionDataSource extends BaseDataSource {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 获取 Options
   * 返回的 optionName 如果含有 table 前缀， 会去掉前缀
   * @param id Option id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<OptionModel | null> {
    return this.models.Options.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Options),
    }).then((option) => {
      if (option) {
        const { optionName, ...rest } = option.toJSON() as any;
        return {
          ...rest,
          optionName:
            optionName && optionName.startsWith(this.tablePrefix)
              ? optionName.substr(this.tablePrefix.length)
              : optionName,
        } as OptionModel;
      }
      return null;
    });
  }

  /**
   * 获取 Options 列表
   * 返回的 optionName 如果含有 table 前缀， 会去掉前缀
   * @param query 搜索条件
   * @param fields 返回的字段
   */
  getList(query: OptionArgs, fields: string[]): Promise<OptionModel[]> {
    return this.models.Options.findAll({
      attributes: this.filterFields(fields, this.models.Options),
      where: {
        ...query,
      },
    }).then((options) =>
      options.map((option) => {
        const { optionName, ...rest } = option.toJSON() as any;
        return {
          ...rest,
          optionName:
            optionName && optionName.startsWith(this.tablePrefix)
              ? optionName.substr(this.tablePrefix.length)
              : optionName,
        } as OptionModel;
      }),
    );
  }

  /**
   * 通过 optionName 获取 optionValue
   * 反回第一个匹配name,或加上table 前缀后的name的值
   * @param optionName optionName
   */
  getOptionValue(optionName: string): Promise<OptionModel['optionValue'] | undefined> {
    return this.models.Options.findAll({
      attributes: ['optionName', 'optionValue'],
      where: {
        optionName: [optionName, `${this.tablePrefix}${optionName}`],
      },
    }).then((options) => {
      // 先找带有当前网站前缀的参数
      let result = options.find((option) => option.optionName === `${this.tablePrefix}${optionName}`)?.optionValue;

      if (result === void 0) {
        result = options.find((option) => option.optionName === optionName)?.optionValue;
      }

      return result;
    });
  }

  /**
   * 是否在在 optionName 的项
   * @param optionName optionName
   */
  async isExists(optionName: string) {
    return (
      (await this.models.Options.count({
        where: {
          optionName: [optionName, `${this.tablePrefix}${optionName}`],
        },
      })) > 0
    );
  }

  /**
   * 新建 Options
   * @param model 新建模型
   */
  async create(model: NewOptionInput, requestUser: RequestUser): Promise<OptionModel> {
    await this.hasCapability(UserCapability.ManageOptions, requestUser, true);

    if (await this.isExists(model.optionName)) {
      throw new ValidationError(
        await this.i18nService.tv(
          'core.datasource.option.name_exists',
          `Option name "${model.optionName}" has existed!`,
          {
            lang: requestUser.lang,
            args: {
              name: model.optionName,
            },
          },
        ),
      );
    }

    const option = await this.models.Options.create(model);
    super.resetOptions();
    return option.toJSON() as OptionModel;
  }

  /**
   * 修改 Options
   * @param id Options id
   * @param model 修改实体模型
   */
  async update(id: number, model: UpdateOptionInput, requestUser: RequestUser): Promise<boolean> {
    await this.hasCapability(UserCapability.ManageOptions, requestUser, true);

    const result = await this.models.Options.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
    super.resetOptions();
    return result;
  }

  /**
   * 删除 Options
   * @param id Option Id
   */
  async delete(id: number, requestUser: RequestUser): Promise<boolean> {
    await this.hasCapability(UserCapability.ManageOptions, requestUser, true);

    const result = await this.models.Options.destroy({
      where: { id },
    }).then((count) => count > 0);
    super.resetOptions();
    return result;
  }
}
