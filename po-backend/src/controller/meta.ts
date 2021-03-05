/**
 * DataSources 必须有 getMetas/createMeta/updateMeta/updateMetaByKey/deleteMeta 方法
 */
import { Resolver, FieldResolver, Query, Mutation, ClassType, Ctx, Root, Arg, ID } from 'type-graphql';
import { lowerFirst } from 'lodash';
import { RuntimeError } from '@/utils/errors';
import BaseResolver from './base';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import Meta from '@/model/meta';

export type Options = {
  /** DataSources Key, 默认值为 rootTypeClass.name */
  dataSourceKey?: keyof DataSources;
  /** 模块名称， 默认值为 rootTypeClass.name */
  name?: string;
};

export function createMetaResolver<MetaModelType, MetaAddModelType>(
  rootTypeClass: ClassType,
  metaTypeClass: ClassType<MetaModelType>,
  metaAddTypeClass: ClassType<MetaAddModelType>,
  { dataSourceKey, name }: Options = {},
) {
  @Resolver((returns) => rootTypeClass, { isAbstract: true })
  abstract class MetaResolver extends BaseResolver {
    /**
     * objectTypeClass.name 必须和 DataSources 中保持一致
     * @param dataSources
     */
    protected getDataSource(dataSources: DataSources) {
      const name = dataSourceKey || (lowerFirst(rootTypeClass.name) as keyof DataSources);
      if (dataSources[name] === null) {
        throw new RuntimeError(`Could not found the DataSource from name ${name}`);
      }
      return dataSources[name] as any;
    }

    @Query((returns) => [metaTypeClass], {
      name: `${lowerFirst(rootTypeClass.name)}Metas`,
      description: `获取 ${name || rootTypeClass.name} 元数据`,
    })
    getMetas(
      @Arg(`${lowerFirst(rootTypeClass.name)}Id`, (type) => ID, { description: `${rootTypeClass.name} Id` })
      modelId: string,
      @Arg('metaKeys', (type) => [String!], { nullable: true, description: 'Meta keys' })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
      @Ctx('dataSources') dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds.getMetas) {
        return ds.getMetas(modelId, metaKeys, this.getFieldNames(fields.fieldsByTypeName[metaTypeClass.name]));
      } else {
        return [];
      }
    }

    @FieldResolver((returns) => [Meta], { description: `${name || rootTypeClass.name} 元数据` })
    metas(
      @Root('id') modelId: number,
      @Arg('metaKeys', (type) => [String!], { nullable: true, description: 'Meta keys' })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
      @Ctx('dataSources') dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds.getMetas) {
        return ds.getMetas(modelId, metaKeys, this.getFieldNames(fields.fieldsByTypeName.Meta));
      } else {
        return [];
      }
    }

    @Mutation((returns) => metaTypeClass, {
      nullable: true,
      name: `add${rootTypeClass.name}Meta`,
      description: `添加 ${name || rootTypeClass.name} 元数据`,
    })
    addMeta(
      @Arg('model', (type) => metaAddTypeClass) model: MetaAddModelType,
      @Ctx('dataSources') dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds && ds.createMeta) {
        return ds.createMeta(model);
      } else {
        return null;
      }
    }

    @Mutation((returns) => Boolean, {
      name: `update${rootTypeClass.name}Meta`,
      description: `修改 ${name || rootTypeClass.name} 元数据`,
    })
    updateMeta(
      @Arg('id', (type) => ID, { description: `${name || rootTypeClass.name} 元数据Id` }) id: number,
      @Arg('metaValue') metaValue: string,
      @Ctx('dataSources') dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds && ds.updateMeta) {
        return ds.updateMeta(id, metaValue);
      } else {
        return false;
      }
    }

    @Mutation((returns) => Boolean, {
      name: `update${rootTypeClass.name}MetaByKey`,
      description: `修改 ${name || rootTypeClass.name} 元数据`,
    })
    updateMetaByKey(
      @Arg(`${lowerFirst(rootTypeClass.name)}Id`, (type) => ID, { description: `${rootTypeClass.name} Id` })
      modelId: string,
      @Arg('metaKey', (type) => String, { description: 'Meta key' }) metaKey: string,
      @Arg('metaValue') metaValue: string,
      @Ctx('dataSources')
      dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds && ds.updateMetaByKey) {
        return ds.updateMetaByKey(modelId, metaKey, metaValue);
      } else {
        return false;
      }
    }

    @Mutation((returns) => Boolean, {
      name: `remove${rootTypeClass.name}Meta`,
      description: `删除 ${name || rootTypeClass.name} 元数据`,
    })
    removeMeta(
      @Arg('id', (type) => ID, { description: `${name || rootTypeClass.name} 元数据Id` }) id: number,
      @Ctx('dataSources') dataSources: DataSources,
    ) {
      const ds = this.getDataSource(dataSources);
      if (ds && ds.deleteMeta) {
        return ds.deleteMeta(id);
      } else {
        return false;
      }
    }
  }

  return MetaResolver;
}
