import { lowerFirst } from 'lodash';
import { ModuleRef } from '@nestjs/core';
import { RuntimeError, ValidationError } from '@/common/utils/gql-errors.utils';
import { BaseDataSource } from './base.datasource';

// Types
import { ModelCtor, Model } from 'sequelize';
import { MetaModel, NewMetaInput } from '../interfaces/meta.interface';
import { MetaDataSource as IMetaDataSource } from '../interfaces/meta-data-source.interface';

/**
 * 默认根据子类名查找实体及字段 Id
 * 如子类名为 PostDataSource, 则会查找 PostMeta 模型 及 postId 字段
 * 如需要指定模型及字段名，可在子类构造函数中进行修改
 * metaKey 不可以同时存在带有前缀的参数，如：po_locale 和 locale, 根据metaKey 修改的时候会被同时修改
 */
export abstract class MetaDataSource<MetaReturnType extends MetaModel, NewMetaInputType extends NewMetaInput>
  extends BaseDataSource
  implements IMetaDataSource<MetaReturnType, NewMetaInputType> {
  protected metaModelIdFieldName: string; // 如 postId
  protected metaModelName: string; // 如 PostMeta

  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
    const rootModelName = this.constructor.name.replace('DataSource', '');
    this.metaModelIdFieldName = `${lowerFirst(rootModelName)}Id`;
    this.metaModelName = `${rootModelName}Meta`;
  }

  private get metaModel() {
    const model = this.sequelize.modelManager.getModel(this.metaModelName);
    if (model === null) {
      throw new RuntimeError(`Could not found sequelize model from name "${this.metaModelName}"`);
    }
    return model as ModelCtor<Model>;
  }

  /**
   * 获取元数据
   * @param id meta Id
   */
  getMeta(id: number): Promise<MetaReturnType | null> {
    return this.metaModel.findByPk(id).then((meta) => {
      if (meta) {
        // 排除掉 private 字段
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { metaKey, private: p, ...rest } = meta.toJSON() as any;
        return ({
          ...rest,
          metaKey: metaKey && metaKey.startsWith(this.tablePrefix) ? metaKey.substr(this.tablePrefix.length) : metaKey,
        } as unknown) as MetaReturnType;
      }
      return null;
    });
  }

  /**
   * 获取元数据(根据metaKey)
   * @param modelId 实体 id
   * @param metaKey metaKey
   */
  getMetaByKey(modelId: number, metaKey: string): Promise<MetaReturnType | null> {
    return this.metaModel
      .findOne({
        where: {
          [this.metaModelIdFieldName]: modelId,
          metaKey,
        },
      })
      .then((meta) => {
        if (meta) {
          // 排除掉 private 字段
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { metaKey, private: p, ...rest } = meta.toJSON() as any;
          return ({
            ...rest,
            metaKey:
              metaKey && metaKey.startsWith(this.tablePrefix) ? metaKey.substr(this.tablePrefix.length) : metaKey,
          } as unknown) as MetaReturnType;
        }
        return null;
      });
  }

  /**
   * 获取元数据
   * 如果 metaKeys 为空或长度为0，则会返回所有非 private 的数据
   * @param modelId 实体 Id
   * @param metaKeys 过滤的字段(不需要添加 table 前缀，会自动匹配到带有前缀的数据)
   * @param fields 返回字段
   */
  getMetas(modelId: number, metaKeys: string[] | undefined, fields: string[]): Promise<MetaReturnType[]> {
    return this.metaModel
      .findAll({
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
          // 排除掉 private 字段
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { metaKey, private: p, ...rest } = meta.toJSON() as any;
          return ({
            ...rest,
            metaKey:
              metaKey && metaKey.startsWith(this.tablePrefix) ? metaKey.substr(this.tablePrefix.length) : metaKey,
          } as unknown) as MetaReturnType;
        }),
      );
  }

  /**
   * 判断元数据是否在在
   * 同时也会匹配 metaKey 加上 table 前缀的参数
   * @param modelId  model Id
   * @param metaKeys  meta keys
   */
  async isMetaExists(modelId: number, metaKey: string): Promise<boolean>;
  async isMetaExists(modelId: number, metaKeys: string[]): Promise<false | string[]>;
  async isMetaExists(modelId: number, metaKeys: string | string[]): Promise<boolean | string[]> {
    if (typeof metaKeys === 'string') {
      return (
        (await this.metaModel.count({
          where: {
            [this.metaModelIdFieldName]: modelId,
            metaKey: [metaKeys, `${this.tablePrefix}${metaKeys}`],
          },
        })) > 0
      );
    } else {
      const metas = await this.metaModel.findAll({
        attributes: ['metaKey'],
        where: {
          [this.metaModelIdFieldName]: modelId,
          metaKey: Array.prototype.concat.apply(
            [],
            metaKeys.map((metaKey) => [metaKey, `${this.tablePrefix}${metaKey}`]),
          ),
        },
      });

      if (metas.length) {
        return metas.map((meta) => meta.getDataValue('metaKey') as string);
      }
      return false;
    }
  }

  /**
   * 创建元数据
   * @param model 元数据实体
   */
  async createMeta(model: NewMetaInputType): Promise<MetaReturnType> {
    const isExists = await this.isMetaExists((model as any)[this.metaModelIdFieldName], model.metaKey);

    if (isExists) {
      throw new ValidationError(`The meta key "${model.metaKey}" has existed!`);
    }

    const meta = await this.metaModel.create(model);
    // 排除掉 private 字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { private: p, ...restMeta } = meta.toJSON() as any;
    return restMeta as MetaReturnType;
  }

  /**
   * 批量创建元数据
   * @param modelId  实体 id
   * @param models 元数据实体集合
   */
  async blukCreateMeta(modelId: number, models: NewMetaInput[]): Promise<MetaReturnType[]> {
    const falseOrMetaKeys = await this.isMetaExists(
      modelId,
      models.map((model) => model.metaKey),
    );
    if (falseOrMetaKeys) {
      throw new ValidationError(`The meta keys (${falseOrMetaKeys.join(',')}) have existed!`);
    }

    const metas = await this.metaModel.bulkCreate(
      models.map((model) => ({
        [this.metaModelIdFieldName]: modelId,
        ...model,
      })),
    );
    return metas.map((meta) => {
      // 排除掉 private 字段
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { private: p, ...restMeta } = meta.toJSON() as any;
      return restMeta as MetaReturnType;
    });
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
