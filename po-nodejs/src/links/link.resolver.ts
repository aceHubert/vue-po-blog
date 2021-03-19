import { Resolver, ResolveField, Query, Mutation, Root, Args, ID, Context } from '@nestjs/graphql';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '~/common/decorators/authorized.decorator';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { LinkDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { User } from '@/users/models/user.model';
import { PagedLinkArgs } from './dto/paged-link.args';
import { NewLinkInput } from './dto/new-link.input';
// import { UpdateLinkInput } from './dto/update-link.input';
import { Link, PagedLink } from './models/link.model';

@Resolver(() => Link)
export class LinkResolver extends BaseResolver {
  constructor(private readonly linkDataSource: LinkDataSource, private readonly userDataSoruce: UserDataSource) {
    super();
  }

  @Query((returns) => Link, { nullable: true, description: '获取链接' })
  link(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree) {
    return this.linkDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Link));
  }

  @Query((returns) => PagedLink, { description: '获取链接分页列表' })
  links(@Args() args: PagedLinkArgs, @Fields() fields: ResolveTree) {
    return this.linkDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedLink.rows.fieldsByTypeName.Link),
    );
  }

  @Authorized()
  @ResolveField((returns) => User, { nullable: true, description: '创建用户' })
  user(
    @Root() { userId }: { userId: number },
    @Fields() fields: ResolveTree,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSoruce.get(userId, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
  }

  @Mutation((returns) => Link, { nullable: true, description: '添加链接' })
  addLink(@Args('model', { type: () => NewLinkInput }) model: NewLinkInput) {
    return this.linkDataSource.create(model);
  }
}
