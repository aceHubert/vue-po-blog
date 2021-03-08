import { Resolver, Query, Mutation, Arg, Args, Ctx, ID, Root, FieldResolver } from 'type-graphql';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '../dataSources';
import TermTaxonomy, {
  TermQueryArgs,
  TermAddModel,
  TermRelationship,
  TermTaxonomyRelationship,
  TermRelationshipQueryArgs,
  TermRelationshipAddModel,
  TermMeta,
  TermMetaAddModel,
} from '@/model/term';

@Resolver((returns) => TermTaxonomy)
export default class TermResolver extends createMetaResolver(TermTaxonomy, TermMeta, TermMetaAddModel, {
  name: '协议',
}) {
  @Query((returns) => TermTaxonomy, { nullable: true, description: '获取协议' })
  term(@Arg('id', (type) => ID) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { term }: DataSources) {
    return term.get(id, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomy], { description: '获取协议列表' })
  terms(@Args() args: TermQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { term }: DataSources) {
    return term.getList(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @FieldResolver((returns) => [TermTaxonomy], { description: '获取协议列表级联子项' })
  children(
    @Root('taxonomyId') parentId: number,
    @Root('taxonomy') taxonomy: string,
    @Root('group') group: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { term }: DataSources,
  ) {
    return term.getList({ taxonomy, parentId, group }, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy));
  }

  @Query((returns) => [TermTaxonomyRelationship], { description: '获取协议关系列表' })
  termRelationships(
    @Args() args: TermRelationshipQueryArgs,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { term }: DataSources,
  ) {
    return term.getRelationships(args, this.getFieldNames(fields.fieldsByTypeName.TermTaxonomyRelationship));
  }

  @Mutation((returns) => TermTaxonomy, { nullable: true, description: '新建协议' })
  addTerm(@Arg('model', (type) => TermAddModel) model: TermAddModel, @Ctx('dataSources') { term }: DataSources) {
    return term.create(model);
  }

  @Mutation((returns) => TermRelationship, { nullable: true, description: '新建协议关系' })
  addTermRelationship(
    @Arg('model', (type) => TermRelationshipAddModel) model: TermRelationshipAddModel,
    @Ctx('dataSources') { term }: DataSources,
  ) {
    return term.createRelationship(model);
  }

  @Mutation((returns) => Boolean, { nullable: true, description: '移除协议关系' })
  removeTermRelationship(
    @Arg('objectId', (type) => ID) objectId: number,
    @Arg('taxonomyId', (type) => ID) taxonomyId: number,
    @Ctx('dataSources') { term }: DataSources,
  ) {
    return term.deleteRelationship(objectId, taxonomyId);
  }
}
