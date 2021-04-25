import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { LinkDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { SimpleUser } from '@/users/models/user.model';
import { PagedLinkArgs } from './dto/paged-link.args';
import { NewLinkInput } from './dto/new-link.input';
import { UpdateLinkInput } from './dto/update-link.input';
import { Link, PagedLink } from './models/link.model';

@Resolver(() => Link)
export class LinkResolver extends BaseResolver {
  constructor(private readonly linkDataSource: LinkDataSource, private readonly userDataSoruce: UserDataSource) {
    super();
  }

  @Query((returns) => Link, { nullable: true, description: '获取链接' })
  link(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Link | null> {
    return this.linkDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Link));
  }

  @Query((returns) => PagedLink, { description: '获取链接分页列表' })
  links(@Args() args: PagedLinkArgs, @Fields() fields: ResolveTree): Promise<PagedLink> {
    return this.linkDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedLink.rows.fieldsByTypeName.Link),
    );
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: '创建用户' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userDataSoruce.getSimpleInfo(userId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Mutation((returns) => Link, { description: '添加链接' })
  addLink(@Args('model', { type: () => NewLinkInput }) model: NewLinkInput): Promise<Link> {
    return this.linkDataSource.create(model);
  }

  @Mutation((returns) => Boolean, { description: '修改链接' })
  modifyLink(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Args('model', { type: () => UpdateLinkInput }) model: UpdateLinkInput,
  ): Promise<boolean> {
    return this.linkDataSource.update(id, model);
  }

  @Mutation((returns) => Boolean, { description: '删除链接' })
  removeLink(@Args('id', { type: () => ID!, description: 'Link id' }) id: number): Promise<boolean> {
    return this.linkDataSource.delete(id);
  }
}
