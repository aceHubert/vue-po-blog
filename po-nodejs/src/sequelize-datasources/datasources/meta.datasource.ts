/**
 * 默认根据子类名查找实体及字段 Id
 * 如子类名为 PostDataSource, 则会查找 PostMeta 模型 及 postId 字段
 * 如需要指定模型及字段名，可在子类中进行修改
 * metaKey 不可以同时存在带有前缀的参数，如：po_locale 和 locale, 根据metaKey 修改的时候会被同时修改
 */
import { lowerFirst } from 'lodash';
import { ModuleRef } from '@nestjs/core';
import { RuntimeError } from '@/common/utils/errors.utils';
import { BaseDataSource } from './base.datasource';

// Types
import { ModelCtor, Model } from 'sequelize';
import { Meta, NewMetaInput } from '@/common/models/meta.model';
import { IMetaDataSource } from '../interfaces/meta-data-source.interface';

export abstract class MetaDataSource<MetaModelType extends Model, NewMetaInputType extends NewMetaInput>
  extends BaseDataSource
  implements IMetaDataSource<MetaModelType, NewMetaInputType> {
  protected metaModelIdFieldName: string; // 如 postId
  protected metaModelName: string; // 如 PostMeta

  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
    const rootModelName = this.constructor.name.replace('DataSource', '');
    this.metaModelIdFieldName = `${lowerFirst(rootModelName)}Id`;
    this.metaModelName = `${rootModelName}Meta`;
  }

  private get metaModel() {
    const model = this.sequelize.modelManager.models.find((model) => model.name === this.metaModelName);
    if (model === null) {
      throw new RuntimeError(`Can not found theme Model from name "${this.metaModelName}"`);
    }
    return model as ModelCtor<MetaModelType>;
  }

  /**
   * 获取元数据
   * 如果 metaKeys 为空或长度为0，则会返回所有非 private 的数据
   * @param modelId 实体 Id
   * @param metaKeys 过滤的字段(不需要添加 table 前缀，会自动匹配到带有前缀的数据)
   * @param fields 返回字段
   */
  getMetas(modelId: number, metaKeys: string[] | undefined, fields: string[]): Promise<MetaModelType[]> {
    return this.metaModel
      ?.findAll({
        attributes: this.filterFields(fields, this.metaModel),
        where: {
          private: 'no',
          [this.metaModelIdFieldName]: modelId,
          ...(metaKeys && metaKeys.length
            ? {
                metaKey: {
                  [this.Op.or]: [
                    { [this.Op.in]: metaKeys },
                    {
                      [this.Op.in]: metaKeys.map((metaKey) => `${this.tablePrefix}${metaKey}`),
                    },
                  ],
                },
              }
            : null),
        },
      })
      .then((metas) =>
        metas.map((meta) => {
          const { metaKey, ...rest } = meta.toJSON() as Meta;
          return ({
            ...rest,
            metaKey:
              metaKey && metaKey.startsWith(this.tablePrefix) ? metaKey.substr(this.tablePrefix.length) : metaKey,
          } as unknown) as MetaModelType;
        }),
      );
  }

  /**
   * 判断元数据是否在在
   * 同时也会匹配 metaKey 加上 table 前缀的参数
   * @param modelId  model Id
   * @param metaKey  meta key
   */
  async isMetaExists(modelId: number, metaKey: string): Promise<boolean> {
    return (
      (await this.metaModel.count({
        where: {
          [this.metaModelIdFieldName]: modelId,
          metaKey: {
            [this.Op.or]: [metaKey, `${this.tablePrefix}${metaKey}`],
          },
        },
      })) > 0
    );
  }

  /**
   * 创建元数据
   * @param model 元数据实体
   */
  async createMeta(model: NewMetaInputType): Promise<MetaModelType | false> {
    const isExists = this.isMetaExists((model as any)[this.metaModelIdFieldName], model.metaKey);

    if (!isExists) {
      return await this.metaModel.create(model);
    }
    return false;
  }

  /**
   * 修改元数据
   * @param id meta Id
   */
  updateMeta(id: number, metaValue: string): Promise<boolean> {
    return this.metaModel
      .update(
        {
          metaValue,
        },
        {
          where: { id },
        },
      )
      .then(([count]) => count > 0);
  }

  /**
   * 根据实体 id 与 metaKey 修改元数据
   * @param modelId 实体 Id
   * @param metaKey meta key
   * @param metaValue meta value
   */
  updateMetaByKey(modelId: number, metaKey: string, metaValue: string): Promise<boolean> {
    return this.metaModel
      .update(
        {
          metaValue,
        },
        {
          where: {
            [this.metaModelIdFieldName]: modelId,
            metaKey: {
              [this.Op.or]: [metaKey, `${this.tablePrefix}${metaKey}`],
            },
          },
        },
      )
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
