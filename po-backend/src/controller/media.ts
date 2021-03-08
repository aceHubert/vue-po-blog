import { Resolver, Query, Mutation, Arg, Args, Ctx, ID } from 'type-graphql';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import Media, { PagedMediaQueryArgs, PagedMedia, MediaAddModel, MediaMeta, MediaMetaAddModel } from '@/model/media';

@Resolver((returns) => Media)
export default class MediaResolver extends createMetaResolver(Media, MediaMeta, MediaMetaAddModel, {
  name: '媒体',
}) {
  @Query((returns) => Media, { nullable: true, description: '获取媒体' })
  media(
    @Arg('id', (type) => ID!) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { media }: DataSources,
  ) {
    return media.get(id, this.getFieldNames(fields.fieldsByTypeName.Media));
  }

  @Query((returns) => PagedMedia, { description: '获取媒体分页列表' })
  medias(@Args() args: PagedMediaQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { media }: DataSources) {
    return media.getPaged(args, this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User));
  }

  @Mutation((returns) => Media, { nullable: true, description: '添加媒体' })
  addMedia(@Arg('model', (type) => MediaAddModel) model: MediaAddModel, @Ctx('dataSources') { media }: DataSources) {
    return media.create(model);
  }
}
