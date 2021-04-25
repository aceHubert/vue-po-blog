import { ModuleRef } from '@nestjs/core';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { MediaDataSource } from '@/sequelize-datasources/datasources';

// Types
import { PagedMediaArgs } from './dto/paged-media.args';
import { NewMediaInput } from './dto/new-mdeia.input';
import { NewMediaMetaInput } from './dto/new-media-meta.input';
import { Media, PagedMedia, MediaMeta } from './models/media.model';

@Resolver(() => Media)
export class MediaResolver extends createMetaResolver(Media, MediaMeta, NewMediaMetaInput, MediaDataSource, {
  description: '媒体',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly mediaDataSource: MediaDataSource) {
    super(moduleRef);
  }

  @Query((returns) => Media, { nullable: true, description: '获取媒体' })
  media(
    @Args('id', { type: () => ID!, description: 'Media id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Media | null> {
    return this.mediaDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Media));
  }

  @Query((returns) => PagedMedia, { description: '获取媒体分页列表' })
  medias(@Args() args: PagedMediaArgs, @Fields() fields: ResolveTree): Promise<PagedMedia> {
    return this.mediaDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User),
    );
  }

  @Mutation((returns) => Media, { description: '添加媒体' })
  addMedia(@Args('model', { type: () => NewMediaInput }) model: NewMediaInput): Promise<Media> {
    return this.mediaDataSource.create(model);
  }

  @Mutation((returns) => Boolean, { description: '删除媒体' })
  removeMedia(@Args('id', { type: () => ID!, description: 'Media id' }) id: number): Promise<boolean> {
    return this.mediaDataSource.delete(id);
  }
}
