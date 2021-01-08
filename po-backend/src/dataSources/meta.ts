/**
 * 默认根据子类名查找实体及字段 Id
 * 如子类名为 PostDataSource, 则会查找 PostMeta 模型 及 postId 字段
 * 如需要指定模型及字段名，可在子类中进行修改
 */
import { SequelizeDataSource } from './sequelizeDataSource';
import { lowerFirst } from 'lodash';
import { ModelCtor, Model } from 'sequelize';

// Types
import { MetaAddModel, MetaUpdateModel } from '@/model/meta';

export abstract class MetaDataSource<
  MetaModelType extends Model,
  MetaAddModelType extends MetaAddModel
> extends SequelizeDataSource {
  protected metaModelIdFieldName: string; // 如 postId
  protected metaModelName: string; // 如 PostMeta

  constructor() {
    super();
    const rootModelName = this.constructor.name.replace('DataSource', '');
    this.metaModelIdFieldName = `${lowerFirst(rootModelName)}Id`;
    this.metaModelName = `${rootModelName}Meta`;
  }

  private get metaModel() {
    const model = this.sequelize.modelManager.models.find((model) => model.name === this.metaModelName);
    if (model === null) {
      throw new Error(`Can not found theme Model from name "${this.metaModelName}"`);
    }
    return model as ModelCtor<MetaModelType>;
  }

  /**
   * 获取元数据
   * @param modelId 实体 Id
   * @param metaKeys 过滤的字段
   * @param fields 返回字段
   */
  getMetas(modelId: number, metaKeys: string[] | undefined, fields: string[]): Promise<MetaModelType[]> {
    return this.metaModel?.findAll({
      attributes: this.filterFields(fields, this.models.PostMeta),
      where: {
        [this.metaModelIdFieldName]: modelId,
        ...(metaKeys && metaKeys.length
          ? {
              [this.Op.in]: metaKeys,
            }
          : null),
      },
    });
  }

  /**
   * 判断元数据是否在在
   * @param modelId  Model Id
   * @param metaKey  Meta key
   */
  async isMetaExists(modelId: number, metaKey: string): Promise<boolean> {
    return (
      (await this.metaModel.count({
        where: {
          [this.metaModelIdFieldName]: modelId,
          metaKey,
        },
      })) > 0
    );
  }

  /**
   * 创建元数据（例如PostMeta 下 同一 postId 下有相同的 metaKey, 则直接返回数据。）
   * @param model 元数据实体
   */
  async createMeta(model: MetaAddModelType): Promise<MetaModelType | false> {
    const isExists = this.isMetaExists((model as any)[this.metaModelIdFieldName], model.metaKey);

    if (!isExists) {
      return await this.metaModel.create(model);
    }
    return false;
  }

  /**
   * 根据 Id 删除元数据
   * @param id Post Id
   */
  updateMeta(id: number, model: MetaUpdateModel): Promise<boolean> {
    return this.metaModel
      .update(model, {
        where: { id },
      })
      .then(([count]) => count > 0);
  }

  /**
   * 根据 Id 删除元数据
   * @param id Post Id
   */
  deleteMeta(id: number): Promise<boolean> {
    return this.metaModel
      .destroy({
        where: { id },
      })
      .then((count) => count > 0);
  }
}
