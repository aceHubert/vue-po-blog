import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { BaseDataSource } from './base.datasource';

// Types
import { OptionArgs } from '@/options/dto/option.args';
import { NewOptionInput } from '@/options/dto/new-option.input';
import { UpdateOptionInput } from '@/options/dto/update-option.input';
import Option from '@/sequelize-entities/entities/options.entity';

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
  get(id: number, fields: string[]): Promise<Option | null> {
    return this.models.Options.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Options),
    }).then((option) => {
      if (option) {
        const { optionName, ...rest } = option.toJSON() as Option;
        return {
          ...rest,
          optionName:
            optionName && optionName.startsWith(this.tablePrefix)
              ? optionName.substr(this.tablePrefix.length)
              : optionName,
        } as Option;
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
  getList(query: OptionArgs, fields: string[]): Promise<Option[]> {
    return this.models.Options.findAll({
      attributes: this.filterFields(fields, this.models.Options),
      where: {
        ...query,
      },
    }).then((options) =>
      options.map((option) => {
        const { optionName, ...rest } = option.toJSON() as Option;
        return {
          ...rest,
          optionName:
            optionName && optionName.startsWith(this.tablePrefix)
              ? optionName.substr(this.tablePrefix.length)
              : optionName,
        } as Option;
      }),
    );
  }

  /**
   * 通过 optionName 获取 optionValue
   * 反回第一个匹配name,或加上table 前缀后的name的值
   * @param optionName optionName
   */
  getOptionValue(optionName: string): Promise<Option['optionValue'] | null> {
    return this.models.Options.findOne({
      attributes: ['optionValue'],
      where: {
        optionName: {
          [this.Op.or]: {
            [this.Op.eq]: optionName,
            [this.Op.eq]: `${this.tablePrefix}${optionName}`,
          },
        },
      },
    }).then((option: Option | null) => (option ? option.optionValue : null));
  }

  /**
   * 是否在在 optionName 的项
   * @param optionName optionName
   */
  async isExists(optionName: string) {
    return (
      (await this.models.Options.count({
        where: {
          optionName: {
            [this.Op.or]: {
              [this.Op.eq]: optionName,
              [this.Op.eq]: `${this.tablePrefix}${optionName}`,
            },
          },
        },
      })) > 0
    );
  }

  /**
   * 新建 Options
   * @param model 新建模型
   */
  async create(model: NewOptionInput): Promise<Option | false> {
    const isExists = await this.isExists(model.optionName);

    if (!isExists) {
      return await this.models.Options.create(model);
    }
    return false;
  }

  /**
   * 修改 Options
   * @param id Options id
   * @param model 修改实体模型
   */
  update(id: number, model: UpdateOptionInput): Promise<boolean> {
    return this.models.Options.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }

  /**
   * 删除 Options
   * @param id Option Id
   */
  delete(id: number): Promise<boolean> {
    return this.models.Options.destroy({
      where: { id },
    }).then((count) => count > 0);
  }
}
