import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { LinkDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { SimpleUser } from '@/users/models/user.model';
import { PagedLinkArgs } from './dto/paged-link.args';
import { NewLinkInput } from './dto/new-link.input';
import { UpdateLinkInput } from './dto/update-link.input';
import { Link, PagedLink } from './models/link.model';

@Resolver(() => Link)
export class LinkResolver extends BaseResolver {
  constructor(private readonly linkDataSource: LinkDataSource, private readonly userDataSource: UserDataSource) {
    super();
  }

  @Query((returns) => Link, { nullable: true, description: 'Get link.' })
  link(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Link | null> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.Link);
    // field resolve
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.linkDataSource.get(id, _field);
  }

  @Query((returns) => PagedLink, { description: 'Get paged links.' })
  links(@Args() args: PagedLinkArgs, @Fields() fields: ResolveTree): Promise<PagedLink> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.PagedLink.rows.fieldsByTypeName.Link);
    // field resolve
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.linkDataSource.getPaged(args, _field);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info.' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(userId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Link, { description: 'Create a new link.' })
  createLink(@Args('model') model: NewLinkInput, @User() requestUser: JwtPayloadWithLang): Promise<Link> {
    return this.linkDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update link.' })
  updateLink(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @Args('model') model: UpdateLinkInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.linkDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete link permanently.' })
  deleteLink(
    @Args('id', { type: () => ID!, description: 'Link id' }) id: number,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.linkDataSource.delete(id, requestUser);
  }
}
