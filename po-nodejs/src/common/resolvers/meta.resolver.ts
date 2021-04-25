/**
 * DataSources 必须有 getMetas/createMeta/updateMeta/updateMetaByKey/deleteMeta 方法
 */
import { ModuleRef } from '@nestjs/core';
import { Type, OnModuleInit } from '@nestjs/common';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { lowerFirst } from 'lodash';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { BaseResolver } from './base.resolver';

// Types
import { MetaDataSource } from '@/sequelize-datasources/interfaces';
import { Meta, NewMetaInput } from '../models/meta.model';

export type Options = {
  /**
   * Query/Mutation命名(以大写命名)， 默认值为:  resolverType.name
   * 例如设置为Post,则会命名为 postMetas, createPostMeta, updatePostMeta, deletePostMeta 的Query和Mutation方法
   */
  resolverName?: string;
  /**
   * resolverName 描述， 默认值为: resolverName 或  resolverType.name
   */
  descriptionName?: string;
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
  { resolverName, descriptionName }: Options = {},
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
      description: `Get ${descriptionName || resolverName || resolverType.name} metas.`,
    })
    getMetas(
      @Args(`${lowerFirst(resolverName || resolverType.name)}Id`, {
        type: () => ID,
        description: `${descriptionName || resolverName || resolverType.name} Id`,
      })
      modelId: number,
      @Args('metaKeys', {
        type: () => [String!],
        nullable: true,
        description: 'meta keys (return all mates if none value is provided)',
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

    @ResolveField((returns) => [Meta], {
      description: `${descriptionName || resolverName || resolverType.name} metas.`,
    })
    metas(
      @Parent() { id: modelId }: { id: number },
      @Args('metaKeys', {
        type: () => [String!],
        nullable: true,
        description: 'Meta keys(return all mates if none value is provided)',
      })
      metaKeys: string[] | undefined,
      @Fields() fields: ResolveTree,
    ) {
      return this.metaDataSource.getMetas(modelId, metaKeys, this.getFieldNames(fields.fieldsByTypeName.Meta));
    }

    @Mutation((returns) => metaReturnType, {
      nullable: true,
      name: `create${resolverName || resolverType.name}Meta`,
      description: `Create a new ${descriptionName || resolverName || resolverType.name} meta.`,
    })
    createMeta(@Args('model', { type: () => newMetaInputType }) model: NewMetaInputType) {
      return this.metaDataSource.createMeta(model);
    }

    @Mutation((returns) => [metaReturnType!], {
      name: `create${resolverName || resolverType.name}Metas`,
      description: `Create bulk of ${descriptionName || resolverName || resolverType.name} metas.`,
    })
    createMetas(
      @Args('id', { type: () => ID, description: `${descriptionName || resolverName || resolverType.name} id` })
      id: number,
      @Args('metas', { type: () => [NewMetaInput!] }) models: NewMetaInput[],
    ) {
      return this.metaDataSource.bulkCreateMeta(id, models);
    }

    @Mutation((returns) => Boolean, {
      name: `update${resolverName || resolverType.name}Meta`,
      description: `Update ${descriptionName || resolverName || resolverType.name} meta.`,
    })
    updateMeta(
      @Args('id', { type: () => ID, description: `${descriptionName || resolverName || resolverType.name} meta id` })
      id: number,
      @Args('metaValue') metaValue: string,
    ) {
      return this.metaDataSource.updateMeta(id, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `update${resolverName || resolverType.name}MetaByKey`,
      description: `Update ${descriptionName || resolverName || resolverType.name} meta by meta key.`,
    })
    updateMetaByKey(
      @Args(`${lowerFirst(resolverName || resolverType.name)}Id`, {
        type: () => ID,
        description: `${descriptionName || resolverName || resolverType.name} Id`,
      })
      modelId: number,
      @Args('metaKey', { description: 'Meta key' }) metaKey: string,
      @Args('metaValue', { description: 'Meta value' }) metaValue: string,
    ) {
      return this.metaDataSource.updateMetaByKey(modelId, metaKey, metaValue);
    }

    @Mutation((returns) => Boolean, {
      name: `delete${resolverName || resolverType.name}Meta`,
      description: `Delete ${descriptionName || resolverName || resolverType.name} meta`,
    })
    deleteMeta(
      @Args('id', { type: () => ID, description: `${descriptionName || resolverName || resolverType.name} meta Id` })
      id: number,
    ) {
      return this.metaDataSource.deleteMeta(id);
    }
  }

  return MetaResolver;
}
