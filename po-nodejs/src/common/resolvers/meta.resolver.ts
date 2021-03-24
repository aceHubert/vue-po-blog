/**
 * DataSources 必须有 getMetas/createMeta/updateMeta/updateMetaByKey/deleteMeta 方法
 */
import { ModuleRef } from '@nestjs/core';
import { Type, OnModuleInit } from '@nestjs/common';
import { Resolver, ResolveField, Query, Mutation, Root, Args, ID } from '@nestjs/graphql';
import { lowerFirst } from 'lodash';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { BaseResolver } from './base.resolver';

// Types
import { MetaDataSource } from '@/sequelize-datasources/interfaces';
import { Meta, NewMetaInput } from '../models/meta.model';

export type Options = {
  /**
   * Query/Mutation命名(以大写命名)， 默认值为:  resolverType.name
   * 例如设置为Post,则会命名为 postMetas, addPostMeta, modifyPostMeta, removePostMeta 的Query和Mutation方法
   */
  resolverName?: string;
  /**
   * resolverName 描述， 默认值为: resolverName 或  resolverType.name
   */
  description?: string;
};

export function createMetaResolver<
  MetaReturnType,
  NewMetaInputType,
  MetaDataSourceType extends MetaDataSource<MetaReturnType, NewMetaInputType>
>(
  resolverType: Function,
  metaReturnType: Type<MetaReturnType>,
  newMetaInputType: Type<NewMetaInputType>,
  metaDataSourceTypeOrToken: Type<MetaDataSourceType> | string | symbol,
  { resolverName, description }: Options = {},
) {
  @Resolver(() => resolverType, { isAbstract: true })
  abstract class MetaResolver extends BaseResolver implements OnModuleInit {
    private metaDataSource!: MetaDataSource<MetaReturnType, NewMetaInputType>;

    constructor(protected readonly moduleRef: ModuleRef) {
      super();
    }

    onModuleInit() {
      this.metaDataSource = this.moduleRef.get(metaDataSourceTypeOrToken, { strict: false });
    }

    /**
     * 获取元数据集合
     *
     */
    @Query((returns) => [metaReturnType!], {
      name: `${lowerFirst(resolverName || resolverType.name)}Metas`,
      description: `获取 ${description || resolverName || resolverType.name} 元数据`,
    })
    getMetas(
      @Args(`${lowerFirst(resolverName || resolverType.name)}Id`, {
        type: () => ID,
        description: `${description || resolverName || resolverType.name} Id`,
      })
      modelId: number,
      @Args('metaKeys', {
        type: () => [String!],
        nullable: true,
        description: 'meta keys(如果为null 或集合长度为0时，返回所有 metas)',
      })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
    ) {
      return this.metaDataSource.getMetas(
        modelId,
        metaKeys,
        this.getFieldNames(fields.fieldsByTypeName[metaReturnType.name]),
      );
    }

    @ResolveField((returns) => [Meta], { description: `${description || resolverName || resolverType.name} 元数据` })
    metas(
      @Root() { id: modelId }: { id: number },
      @Args('metaKeys', { type: () => [String!], nullable: true, description: 'Meta keys' })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
    ) {
      return this.metaDataSource.getMetas(modelId, metaKeys, this.getFieldNames(fields.fieldsByTypeName.Meta));
    }

    @Mutation((returns) => metaReturnType, {
      nullable: true,
      name: `add${resolverName || resolverType.name}Meta`,
      description: `添加 ${description || resolverName || resolverType.name} 元数据`,
    })
    addMeta(@Args('model', { type: () => newMetaInputType }) model: NewMetaInputType) {
      return this.metaDataSource.createMeta(model);
    }

    @Mutation((returns) => [metaReturnType!], {
      name: `add${resolverName || resolverType.name}Metas`,
      description: `批量添加 ${description || resolverName || resolverType.name} 元数据`,
    })
    addMetas(
      @Args('id', { type: () => ID, description: `${description || resolverName || resolverType.name} Meta Id` })
      id: number,
      @Args('models', { type: () => [NewMetaInput!] }) models: NewMetaInput[],
    ) {
      return this.metaDataSource.blukCreateMeta(id, models);
    }

    @Mutation((returns) => Boolean, {
      name: `modify${resolverName || resolverType.name}Meta`,
      description: `修改 ${description || resolverName || resolverType.name} 元数据`,
    })
    modifyMeta(
      @Args('id', { type: () => ID, description: `${description || resolverName || resolverType.name} Meta Id` })
      id: number,
      @Args('metaValue') metaValue: string,
    ) {
      return this.metaDataSource.updateMeta(id, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `modify${resolverName || resolverType.name}MetaByKey`,
      description: `修改 ${description || resolverName || resolverType.name} 元数据`,
    })
    modifyMetaByKey(
      @Args(`${lowerFirst(resolverName || resolverType.name)}Id`, {
        type: () => ID,
        description: `${description || resolverName || resolverType.name} Id`,
      })
      modelId: number,
      @Args('metaKey', { description: 'Meta key' }) metaKey: string,
      @Args('metaValue', { description: 'Meta value' }) metaValue: string,
    ) {
      return this.metaDataSource.updateMetaByKey(modelId, metaKey, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `remove${resolverName || resolverType.name}Meta`,
      description: `删除 ${description || resolverName || resolverType.name} 元数据`,
    })
    removeMeta(
      @Args('id', { type: () => ID, description: `${description || resolverName || resolverType.name} Meta Id` })
      id: number,
    ) {
      return this.metaDataSource.deleteMeta(id);
    }
  }

  return MetaResolver;
}
