import { SequelizeDataSource } from './sequelizeDataSource';

// Types
import Option, { OptionQueryArgs, OptionAddModel, OptionUpdateModel } from '@/model/option';

export default class OptionDataSource extends SequelizeDataSource {
  get(id: number, fields: string[]): Promise<Option | null> {
    return this.models.Options.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Options),
    });
  }

  getList(query: OptionQueryArgs, fields: string[]): Promise<Option[]> {
    return this.models.Options.findAll({
      attributes: this.filterFields(fields, this.models.Options),
      where: {
        ...query,
      },
    });
  }

  getValue(name: string): Promise<Option['optionValue'] | null> {
    return this.models.Options.findOne({
      attributes: ['optionValue'],
      where: {
        optionName: name,
      },
    }).then((option: Option | null) => (option ? option.optionValue : null));
  }

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
   * 修改配置
   * @param id Option Id
   * @param model 修改实体模型
   */
  update(id: number, model: OptionUpdateModel): Promise<boolean> {
    return this.models.Options.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }

  /**
   * 根据 Id 删除
   * @param id Option Id
   */
  delete(id: number): Promise<boolean> {
    return this.models.Options.destroy({
      where: { id },
    }).then((count) => count > 0);
  }
}
