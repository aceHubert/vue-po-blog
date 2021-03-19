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
  name: '媒体',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly mediaDataSource: MediaDataSource) {
    super(moduleRef);
  }

  @Query((returns) => Media, { nullable: true, description: '获取媒体' })
  media(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree) {
    return this.mediaDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Media));
  }

  @Query((returns) => PagedMedia, { description: '获取媒体分页列表' })
  medias(@Args() args: PagedMediaArgs, @Fields() fields: ResolveTree) {
    return this.mediaDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User),
    );
  }

  @Mutation((returns) => Media, { nullable: true, description: '添加媒体' })
  addMedia(@Args('model', { type: () => NewMediaInput }) model: NewMediaInput) {
    return this.mediaDataSource.create(model);
  }
}
