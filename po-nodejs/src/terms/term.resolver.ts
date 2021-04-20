import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Int, Parent, Context } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { TermDataSource } from '@/sequelize-datasources/datasources';

// Types
import { TermArgs } from './dto/term.args';
import { TermByObjectIdArgs } from './dto/term-by-object-id.args';
import { NewTermInput } from './dto/new-term.input';
import { NewTermMetaInput } from './dto/new-term-meta.input';
import { NewTermRelationshipInput } from './dto/new-term-relationship.input';
import { UpdateTermInput } from './dto/update-term.input';
import { TermTaxonomy, TermRelationship, TermMeta } from './models/term.model';
import { Authorized } from '~/common/decorators/authorized.decorator';

@Resolver(() => TermTaxonomy)
export class TermResolver extends createMetaResolver(TermTaxonomy, TermMeta, NewTermMetaInput, TermDataSource, {
  resolverName: 'Term',
  description: '协议',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly termDataSource: TermDataSource) {
    super(moduleRef);
  }

  @Query((returns) => TermTaxonomy, { nullable: true, description: '获取协议' })
  term(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomy | null> {
    return this.termDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy!], { description: '获取协议列表' })
  terms(@Args() args: TermArgs, @Fields() fields: ResolveTree): Promise<TermTaxonomy[]> {
    return this.termDataSource.getList(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy)).then((terms) =>
      terms.map((term) =>
        // 级联查询将参数传给 children
        Object.assign(
          {
            taxonomy: args.taxonomy,
            group: args.group,
          },
          term,
        ),
      ),
    );
  }

  @ResolveField((returns) => [TermTaxonomy!], { description: '获取协议列表级联子项' })
  children(
    @Parent() { taxonomyId: parentId }: { taxonomyId: number },
    @Args('group', { type: () => Int, nullable: true, description: 'group' }) group: number,
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomy[]> {
    return this.termDataSource.getList({ parentId, group }, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy!], { description: '根据objectId获取协议列表' })
  termsByObjectId(@Args() args: TermByObjectIdArgs, @Fields() fields: ResolveTree): Promise<TermTaxonomy[]> {
    return this.termDataSource.getListByObjectId(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Authorized()
  @Mutation((returns) => TermTaxonomy, { description: '新建协议' })
  addTerm(
    @Args('model', { type: () => NewTermInput }) model: NewTermInput,
    @Context('user') requestUser: JwtPayload,
  ): Promise<TermTaxonomy> {
    return this.termDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => TermRelationship, { description: '新建协议关系' })
  addTermRelationship(
    @Args('model', { type: () => NewTermRelationshipInput }) model: NewTermRelationshipInput,
    @Context('user') requestUser: JwtPayload,
  ): Promise<TermRelationship> {
    return this.termDataSource.createRelationship(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改协议' })
  modifyTerm(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Args('model', { type: () => UpdateTermInput }) model: UpdateTermInput,
  ): Promise<boolean> {
    return this.termDataSource.update(id, model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '移除协议关系' })
  removeTermRelationship(
    @Args('objectId', { type: () => ID, description: '关联对象 id' }) objectId: number,
    @Args('taxonomyId', { type: () => ID, description: '类别 id' }) taxonomyId: number,
  ): Promise<boolean> {
    return this.termDataSource.deleteRelationship(objectId, taxonomyId);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '移除协议(包括相关联协议关系)' })
  removeTerm(@Args('id', { type: () => ID, description: 'Term id' }) id: number): Promise<boolean> {
    return this.termDataSource.delete(id);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '批量移除协议(包括相关联协议关系)' })
  blukRemoveTerms(@Args('ids', { type: () => [ID!], description: 'Term ids' }) ids: number[]): Promise<boolean> {
    return this.termDataSource.blukDelete(ids);
  }
}
