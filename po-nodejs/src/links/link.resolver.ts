import DataLoader from 'dataloader';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { LinkDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { UserSimpleModel } from '@/sequelize-datasources/interfaces';
import { SimpleUser } from '@/users/models/user.model';
import { PagedLinkArgs } from './dto/paged-link.args';
import { NewLinkInput } from './dto/new-link.input';
import { UpdateLinkInput } from './dto/update-link.input';
import { Link, PagedLink } from './models/link.model';

@Resolver(() => Link)
export class LinkResolver extends BaseResolver {
  private userLoader!: DataLoader<{ userId: number; fields: string[] }, UserSimpleModel>;

  constructor(private readonly linkDataSource: LinkDataSource, private readonly userDataSource: UserDataSource) {
    super();
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

  @Query((returns) => Link, { nullable: true, description: 'Get link.' })
  link(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Link | null> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.Link);
    // graphql 字段与数据库字段不相同
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.linkDataSource.get(id, _field);
  }

  @Query((returns) => PagedLink, { description: 'Get paged links.' })
  links(@Args() args: PagedLinkArgs, @Fields() fields: ResolveTree): Promise<PagedLink> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.PagedLink.rows.fieldsByTypeName.Link);
    // graphql 字段与数据库字段不相同
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.linkDataSource.getPaged(args, _field);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info.' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userLoader.load({ userId, fields: this.getFieldNames(fields.fieldsByTypeName.SimpleUser) });
  }

  @Authorized()
  @Mutation((returns) => Link, { description: 'Create a new link.' })
  createLink(@Args('model') model: NewLinkInput, @User() requestUser: RequestUser): Promise<Link> {
    return this.linkDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update link.' })
  updateLink(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Args('model') model: UpdateLinkInput,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.linkDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete link permanently.' })
  deleteLink(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.linkDataSource.delete(id, requestUser);
  }
}
