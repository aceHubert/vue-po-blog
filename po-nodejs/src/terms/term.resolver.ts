import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Root } from '@nestjs/graphql';
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
  term(@Args('id', { type: () => ID, description: 'Term id' }) id: number, @Fields() fields: ResolveTree) {
    return this.termDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy], { description: '获取协议列表' })
  terms(@Args() args: TermArgs, @Fields() fields: ResolveTree) {
    return this.termDataSource.getList(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @ResolveField((returns) => [TermTaxonomy], { description: '获取协议列表级联子项' })
  children(
    @Root() { taxonomyId: parentId, taxonomy, group }: { taxonomyId: number; taxonomy: string; group: number },
    @Fields() fields: ResolveTree,
  ) {
    return this.termDataSource.getList(
      { taxonomy, parentId, group },
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    );
  }

  @Query((returns) => [TermTaxonomyRelationship], { description: '获取协议关系列表' })
  termRelationships(@Args() args: TermRelationshipArgs, @Fields() fields: ResolveTree) {
    return this.termDataSource.getTermRelationships(
      args,
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomyRelationship),
    );
  }

  @Mutation((returns) => TermTaxonomy, { nullable: true, description: '新建协议' })
  addTerm(@Args('model', { type: () => NewTermInput }) model: NewTermInput) {
    return this.termDataSource.create(model);
  }

  @Mutation((returns) => TermRelationship, { nullable: true, description: '新建协议关系' })
  addTermRelationship(@Args('model', { type: () => NewTermRelationshipInput }) model: NewTermRelationshipInput) {
    return this.termDataSource.createRelationship(model);
  }

  @Mutation((returns) => Boolean, { description: '修改协议' })
  modifyTerm(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Args('model', { type: () => UpdateTermInput }) model: UpdateTermInput,
  ) {
    return this.termDataSource.update(id, model);
  }

  @Mutation((returns) => Boolean, { description: '移除协议关系' })
  removeTermRelationship(
    @Args('objectId', { type: () => ID, description: '关联对象 id' }) objectId: number,
    @Args('taxonomyId', { type: () => ID, description: '类别 id' }) taxonomyId: number,
  ) {
    return this.termDataSource.deleteRelationship(objectId, taxonomyId);
  }

  @Mutation((returns) => Boolean, { description: '移除协议(包括相关联协议关系)' })
  removeTerm(@Args('id', { type: () => ID, description: 'Term id' }) id: number) {
    return this.termDataSource.delete(id);
  }
}
