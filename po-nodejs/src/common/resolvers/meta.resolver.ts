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
import { IMetaDataSource } from '@/sequelize-datasources/interfaces';
import { Meta } from '../models/meta.model';

export type Options = {
  /** 模块名称， 默认值为  rootModel.name */
  name?: string;
};

export function createMetaResolver<
  MetaModelType,
  NewMetaInputType,
  MetaDataSourceType extends IMetaDataSource<MetaModelType, NewMetaInputType>
>(
  rootModel: Type,
  metaModel: Type<MetaModelType>,
  newMetaInput: Type<NewMetaInputType>,
  metaDataSource: Type<MetaDataSourceType>,
  { name }: Options = {},
) {
  @Resolver(() => rootModel, { isAbstract: true })
  abstract class MetaResolver extends BaseResolver implements OnModuleInit {
    private metaDataSource!: IMetaDataSource<MetaModelType, NewMetaInputType>;

    constructor(protected readonly moduleRef: ModuleRef) {
      super();
    }

    onModuleInit() {
      this.metaDataSource = this.moduleRef.get(metaDataSource, { strict: false });
    }

    @Query((returns) => [metaModel!], {
      name: `${lowerFirst(rootModel.name)}Metas`,
      description: `获取 ${name || rootModel.name} 元数据`,
    })
    getMetas(
      @Args(`${lowerFirst(rootModel.name)}Id`, { type: () => ID, description: `${rootModel.name} Id` })
      modelId: number,
      @Args('metaKeys', { type: () => [String!], nullable: true, description: 'Meta keys' })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
    ) {
      return this.metaDataSource.getMetas(
        modelId,
        metaKeys,
        this.getFieldNames(fields.fieldsByTypeName[metaModel.name]),
      );
    }

    @ResolveField((returns) => [Meta], { description: `${name || rootModel.name} 元数据` })
    metas(
      @Root() { id: modelId }: { id: number },
      @Args('metaKeys', { type: () => [String!], nullable: true, description: 'Meta keys' })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
    ) {
      return this.metaDataSource.getMetas(modelId, metaKeys, this.getFieldNames(fields.fieldsByTypeName.Meta));
    }

    @Mutation((returns) => metaModel, {
      nullable: true,
      name: `add${rootModel.name}Meta`,
      description: `添加 ${name || rootModel.name} 元数据`,
    })
    addMeta(@Args('model', { type: () => newMetaInput }) model: NewMetaInputType) {
      return this.metaDataSource.createMeta(model);
    }

    @Mutation((returns) => Boolean, {
      name: `update${rootModel.name}Meta`,
      description: `修改 ${name || rootModel.name} 元数据`,
    })
    updateMeta(
      @Args('id', { type: () => ID, description: `${name || rootModel.name} 元数据Id` }) id: number,
      @Args('metaValue') metaValue: string,
    ) {
      return this.metaDataSource.updateMeta(id, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `update${rootModel.name}MetaByKey`,
      description: `修改 ${name || rootModel.name} 元数据`,
    })
    updateMetaByKey(
      @Args(`${lowerFirst(rootModel.name)}Id`, { type: () => ID, description: `${rootModel.name} Id` })
      modelId: number,
      @Args('metaKey', { description: 'Meta key' }) metaKey: string,
      @Args('metaValue', { description: 'Meta value' }) metaValue: string,
    ) {
      return this.metaDataSource.updateMetaByKey(modelId, metaKey, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `remove${rootModel.name}Meta`,
      description: `删除 ${name || rootModel.name} 元数据`,
    })
    removeMeta(@Args('id', { type: () => ID, description: `${name || rootModel.name} 元数据Id` }) id: number) {
      return this.metaDataSource.deleteMeta(id);
    }
  }

  return MetaResolver;
}
