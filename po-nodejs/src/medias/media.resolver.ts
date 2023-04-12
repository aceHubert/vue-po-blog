import DataLoader from 'dataloader';
import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Args, ID, Parent } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { MediaDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { UserSimpleModel } from '@/sequelize-datasources/interfaces';
import { SimpleUser } from '@/users/models/user.model';
import { PagedMediaArgs } from './dto/paged-media.args';
import { NewMediaInput } from './dto/new-mdeia.input';
import { NewMediaMetaInput } from './dto/new-media-meta.input';
import { Media, PagedMedia, MediaMeta } from './models/media.model';

@Resolver(() => Media)
export class MediaResolver extends createMetaResolver(Media, MediaMeta, NewMediaMetaInput, MediaDataSource, {
  descriptionName: 'media',
}) {
  private userLoader!: DataLoader<{ userId: number; fields: string[] }, UserSimpleModel>;

  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly mediaDataSource: MediaDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
    this.userLoader = new DataLoader(async (keys) => {
      if (keys.length) {
        // 所有调用的 fields 都是相同的
        const results = await this.userDataSource.getSimpleInfo(
          keys.map((key) => key.userId),
          keys[0].fields,
        );
        return keys.map(({ userId }) => results[userId] || null);
      } else {
        return Promise.resolve([]);
      }
    });
  }

  @Query((returns) => Media, { nullable: true, description: 'Get media.' })
  media(
    @Args('id', { type: () => ID!, description: 'Media id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Media | null> {
    const _fields = this.getFieldNames(fields.fieldsByTypeName.Media);
    // graphql 字段与数据库字段不相同
    if (_fields.includes('user')) {
      _fields.push('userId');
    }
    return this.mediaDataSource.get(id, _fields);
  }

  @Query((returns) => PagedMedia, { description: 'Get paged medias.' })
  medias(@Args() args: PagedMediaArgs, @Fields() fields: ResolveTree): Promise<PagedMedia> {
    const _fields = this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User);
    // graphql 字段与数据库字段不相同
    if (_fields.includes('user')) {
      _fields.push('userId');
    }
    return this.mediaDataSource.getPaged(args, _fields);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info.' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userLoader.load({ userId, fields: this.getFieldNames(fields.fieldsByTypeName.SimpleUser) });
  }

  @Authorized()
  @Mutation((returns) => Media, { description: 'Create a new media.' })
  createMedia(@Args('model') model: NewMediaInput, @User() requestUser: RequestUser): Promise<Media> {
    return this.mediaDataSource.create(model, requestUser);
  }
}
