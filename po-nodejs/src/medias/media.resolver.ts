import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Parent } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { MediaDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { SimpleUser } from '@/users/models/user.model';
import { PagedMediaArgs } from './dto/paged-media.args';
import { NewMediaInput } from './dto/new-mdeia.input';
import { NewMediaMetaInput } from './dto/new-media-meta.input';
import { Media, PagedMedia, MediaMeta } from './models/media.model';

@Resolver(() => Media)
export class MediaResolver extends createMetaResolver(Media, MediaMeta, NewMediaMetaInput, MediaDataSource, {
  descriptionName: 'media',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly mediaDataSource: MediaDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Media, { nullable: true, description: 'Get media.' })
  media(
    @Args('id', { type: () => ID!, description: 'Media id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Media | null> {
    const _fields = this.getFieldNames(fields.fieldsByTypeName.Media);
    // field resolve
    if (_fields.includes('user')) {
      _fields.push('userId');
    }
    return this.mediaDataSource.get(id, _fields);
  }

  @Query((returns) => PagedMedia, { description: 'Get paged medias.' })
  medias(@Args() args: PagedMediaArgs, @Fields() fields: ResolveTree): Promise<PagedMedia> {
    const _fields = this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User);
    // field resolve
    if (_fields.includes('user')) {
      _fields.push('userId');
    }
    return this.mediaDataSource.getPaged(args, _fields);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info.' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(userId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Media, { description: 'Create a new media.' })
  createMedia(@Args('model') model: NewMediaInput, @User() requestUser: JwtPayloadWithLang): Promise<Media> {
    return this.mediaDataSource.create(model, requestUser);
  }
}
