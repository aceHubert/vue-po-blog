import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Int, Parent } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { User } from '@/common/decorators/user.decorator';
import { TermDataSource } from '@/sequelize-datasources/datasources';

// Types
import { TermArgs } from './dto/term.args';
import { TermByObjectIdArgs } from './dto/term-by-object-id.args';
import { NewTermInput } from './dto/new-term.input';
import { NewTermMetaInput } from './dto/new-term-meta.input';
import { NewTermRelationshipInput } from './dto/new-term-relationship.input';
import { UpdateTermInput } from './dto/update-term.input';
import { TermTaxonomy, TermRelationship, TermMeta } from './models/term.model';
import { Authorized } from '@/common/decorators/authorized.decorator';

@Resolver(() => TermTaxonomy)
export class TermResolver extends createMetaResolver(TermTaxonomy, TermMeta, NewTermMetaInput, TermDataSource, {
  resolverName: 'Term',
  descriptionName: 'term',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly termDataSource: TermDataSource) {
    super(moduleRef);
  }

  @Query((returns) => TermTaxonomy, { nullable: true, description: 'Get term.' })
  term(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomy | null> {
    return this.termDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy!], { description: 'Get terms.' })
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

  @ResolveField((returns) => [TermTaxonomy!], { description: 'Get cascade terms.' })
  children(
    @Parent() { taxonomyId: parentId }: { taxonomyId: number },
    @Args('group', { type: () => Int, nullable: true, description: 'group' }) group: number,
    @Fields() fields: ResolveTree,
  ): Promise<TermTaxonomy[]> {
    return this.termDataSource.getList({ parentId, group }, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy!], { description: 'Get terms by objectId.' })
  termsByObjectId(@Args() args: TermByObjectIdArgs, @Fields() fields: ResolveTree): Promise<TermTaxonomy[]> {
    return this.termDataSource.getListByObjectId(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Authorized()
  @Mutation((returns) => TermTaxonomy, { description: 'Create a new term.' })
  createTerm(
    @Args('model', { type: () => NewTermInput }) model: NewTermInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<TermTaxonomy> {
    return this.termDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => TermRelationship, { description: 'Create a new term relationship.' })
  createTermRelationship(
    @Args('model', { type: () => NewTermRelationshipInput }) model: NewTermRelationshipInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<TermRelationship> {
    return this.termDataSource.createRelationship(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update term.' })
  updateTerm(
    @Args('id', { type: () => ID, description: 'Term id' }) id: number,
    @Args('model', { type: () => UpdateTermInput }) model: UpdateTermInput,
  ): Promise<boolean> {
    return this.termDataSource.update(id, model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete term permanently (include term relationship).' })
  deleteTerm(@Args('id', { type: () => ID, description: 'Term id' }) id: number): Promise<boolean> {
    return this.termDataSource.delete(id);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete termspermanently (include term relationship).' })
  bulkDeleteTerms(@Args('ids', { type: () => [ID!], description: 'Term ids' }) ids: number[]): Promise<boolean> {
    return this.termDataSource.bulkDelete(ids);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete term relationship permanently.' })
  deleteTermRelationship(
    @Args('objectId', { type: () => ID, description: 'Object id' }) objectId: number,
    @Args('taxonomyId', { type: () => ID, description: 'Taxonomy id' }) taxonomyId: number,
  ): Promise<boolean> {
    return this.termDataSource.deleteRelationship(objectId, taxonomyId);
  }
}
