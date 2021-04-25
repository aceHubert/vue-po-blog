import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID, Int } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PostType } from '@/orm-entities/interfaces';
import { PostDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { SimpleUser } from '@/users/models/user.model';
import { PagedPageArgs } from './dto/paged-page.args';
import { NewPageInput } from './dto/new-page.input';
import { NewPostMetaInput } from '@/posts/dto/new-post-meta.input';
import { UpdatePageInput } from './dto/update-page.input';
import { Page, PagedPage } from './models/page.model';
import { PostMeta } from '@/posts/models/post.model';
import { PostStatusCount, PostDayCount, PostMonthCount, PostYearCount } from '../posts/models/post.model';

@Resolver(() => Page)
export class PageResolver extends createMetaResolver(Page, PostMeta, NewPostMetaInput, PostDataSource, {
  descriptionName: 'page',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly postDataSource: PostDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Page, { nullable: true, description: 'Get page.' })
  page(
    @Args('id', { type: () => ID, description: 'Page id' }) id: number,
    @Fields() fields: ResolveTree,
    @User() requestUser?: JwtPayloadWithLang,
  ): Promise<Page | null> {
    return this.postDataSource.get(id, PostType.Page, this.getFieldNames(fields.fieldsByTypeName.Page), requestUser);
  }

  @Query((returns) => PagedPage, { description: 'Get paged pages.' })
  pages(@Args() args: PagedPageArgs, @Fields() fields: ResolveTree, @User() requestUser?: JwtPayloadWithLang) {
    return this.postDataSource.getPaged(
      args,
      PostType.Page,
      this.getFieldNames(fields.fieldsByTypeName.PagedPage.rows.fieldsByTypeName.Page),
      requestUser,
    );
  }

  @Authorized()
  @Query((returns) => [PostStatusCount], {
    description: "Get page count by status (include other's Pages, depends on your role).",
  })
  pageCountByStatus(@User() requestUser: JwtPayloadWithLang) {
    return this.postDataSource.getCountByStatus(PostType.Page, requestUser);
  }

  @Authorized()
  @Query((returns) => Int, { description: "Get yourself's page count" })
  pageCountBySelf(@User() requestUser: JwtPayloadWithLang) {
    return this.postDataSource.getCountBySelf(PostType.Page, requestUser);
  }

  @Query((returns) => [PostDayCount], { description: 'Get page count by day.' })
  pageCountByDay(@Args('month', { description: 'month (format: yyyyMM)' }) month: string) {
    return this.postDataSource.getCountByDay(month, PostType.Page);
  }

  @Query((returns) => [PostMonthCount], { description: 'Get page count by month.' })
  pageCountByMonth(
    @Args('year', { nullable: true, description: 'year (format: yyyy)' }) year: string,
    @Args('months', {
      type: () => Int,
      nullable: true,
      description: 'Latest number of months from current (default: 12)',
    })
    months: number,
  ) {
    return this.postDataSource.getCountByMonth({ year, months }, PostType.Page);
  }

  @Query((returns) => [PostYearCount], { description: 'Get page count by year.' })
  pageCountByYear() {
    return this.postDataSource.getCountByYear(PostType.Page);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'Author info' })
  author(
    @Parent() { author: authorId }: { author: number },
    @Fields() fields: ResolveTree,
  ): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(authorId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Page, { description: 'Create a new page.' })
  createPage(
    @Args('model', { type: () => NewPageInput }) model: NewPageInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<Page> {
    return this.postDataSource.create(model, PostType.Page, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update page (not allow to update in "trash" status).' })
  updatePage(
    @Args('id', { type: () => ID, description: 'Page id' }) id: number,
    @Args('model', { type: () => UpdatePageInput }) model: UpdatePageInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.postDataSource.update(id, model, requestUser);
  }

  // 修改状态，删除共用Post方法
}
