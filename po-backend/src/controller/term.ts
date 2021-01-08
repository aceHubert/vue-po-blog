import { Resolver, Query, Mutation, Arg, Args, Ctx, ID } from 'type-graphql';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '../dataSources';
import Term, {
  TermQueryArgs,
  TermAddModel,
  TermRelationship,
  TermRelationshipAddModel,
  TermMeta,
  TermMetaAddModel,
} from '@/model/term';

@Resolver((returns) => Term)
export default class TermResolver extends createMetaResolver(Term, TermMeta, TermMetaAddModel, {
  name: '协议',
}) {
  @Query((returns) => Term, { nullable: true, description: '获取协议' })
  term(@Arg('id', (type) => ID) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { term }: DataSources) {
    return term.get(id, Object.keys(fields.fieldsByTypeName.Term));
  }

  @Query((returns) => [Term], { description: '获取协议列表' })
  terms(@Args() args: TermQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { term }: DataSources) {
    return term.getList(args, Object.keys(fields.fieldsByTypeName.Term));
  }

  @Mutation((returns) => Term, { nullable: true, description: '新建协议' })
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
}
