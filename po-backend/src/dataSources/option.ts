import { SequelizeDataSource } from './sequelizeDataSource';

// Types
import Option, { OptionQueryArgs, OptionAddModel, OptionUpdateModel } from '@/model/option';

export default class OptionDataSource extends SequelizeDataSource {
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
        };
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
  getList(query: OptionQueryArgs, fields: string[]): Promise<Option[]> {
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
        };
      }),
    );
  }

  /**
   * 通过 optionName 获取 optionValue
   * 反回第一个匹配name,或加上table 前缀后的name的值
   * @param name optionName
   */
  getValue(name: string): Promise<Option['optionValue'] | null> {
    return this.models.Options.findOne({
      attributes: ['optionValue'],
      where: {
        optionName: {
          [this.Op.or]: {
            [this.Op.eq]: name,
            [this.Op.eq]: `${this.tablePrefix}${name}`,
          },
        },
      },
    }).then((option: Option | null) => (option ? option.optionValue : null));
  }

  /**
   * 新建 Options
   * @param model 新建模型
   */
  async create(model: OptionAddModel): Promise<Option | false> {
    const isExists =
      (await this.models.Options.count({
        where: {
          optionName: model.optionName,
        },
      })) > 0;

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
  update(id: number, model: OptionUpdateModel): Promise<boolean> {
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
