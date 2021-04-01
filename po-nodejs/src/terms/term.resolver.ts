import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Parent } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { TermDataSource } from '@/sequelize-datasources/datasources';

// Types
import { TermArgs } from './dto/term.args';
import { TermRelationshipArgs } from './dto/term-relationship.args';
import { NewTermInput } from './dto/new-term.input';
import { NewTermMetaInput } from './dto/new-term-meta.input';
import { NewTermRelationshipInput } from './dto/new-term-relationship.input';
import { UpdateTermInput } from './dto/update-term.input';
import { TermTaxonomy, TermRelationship, TermTaxonomyRelationship, TermMeta } from './models/term.model';

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

  @Query((returns) => [TermTaxonomy], { description: '获取协议列表' })
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

  @ResolveField((returns) => [TermTaxonomy], { description: '获取协议列表级联子项' })
  children(
    @Parent() { taxonomyId: parentId, taxonomy, group }: { taxonomyId: number; taxonomy: string; group: number },
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomy[]> {
    return this.termDataSource.getList(
      { taxonomy, parentId, group },
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    );
  }

  @Query((returns) => [TermTaxonomyRelationship], { description: '获取协议关系列表' })
  termRelationships(
    @Args() args: TermRelationshipArgs,
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomyRelationship[]> {
    return this.termDataSource.getTermRelationships(
      args,
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomyRelationship),
    );
  }

  @Mutation((returns) => TermTaxonomy, { description: '新建协议' })
  addTerm(@Args('model', { type: () => NewTermInput }) model: NewTermInput): Promise<TermTaxonomy> {
    return this.termDataSource.create(model);
  }

  @Mutation((returns) => TermRelationship, { description: '新建协议关系' })
  addTermRelationship(
    @Args('model', { type: () => NewTermRelationshipInput }) model: NewTermRelationshipInput,
  ): Promise<TermRelationship> {
    return this.termDataSource.createRelationship(model);
  }

  @Mutation((returns) => Boolean, { description: '修改协议' })
  modifyTerm(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Args('model', { type: () => UpdateTermInput }) model: UpdateTermInput,
  ): Promise<boolean> {
    return this.termDataSource.update(id, model);
  }

  @Mutation((returns) => Boolean, { description: '移除协议关系' })
  removeTermRelationship(
    @Args('objectId', { type: () => ID, description: '关联对象 id' }) objectId: number,
    @Args('taxonomyId', { type: () => ID, description: '类别 id' }) taxonomyId: number,
  ): Promise<boolean> {
    return this.termDataSource.deleteRelationship(objectId, taxonomyId);
  }

  @Mutation((returns) => Boolean, { description: '移除协议(包括相关联协议关系)' })
  removeTerm(@Args('id', { type: () => ID, description: 'Term id' }) id: number): Promise<boolean> {
    return this.termDataSource.delete(id);
  }

  @Mutation((returns) => Boolean, { description: '批量移除协议(包括相关联协议关系)' })
  blukRemoveTerms(@Args('ids', { type: () => [ID!], description: 'Term ids' }) ids: number[]): Promise<boolean> {
    return this.termDataSource.blukDelete(ids);
  }
}
