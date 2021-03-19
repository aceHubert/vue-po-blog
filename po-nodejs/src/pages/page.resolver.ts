import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Root, Args, ID, Int, Context } from '@nestjs/graphql';
import { PostType } from '@/common/helpers/enums';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '~/common/decorators/authorized.decorator';
import { PostDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { User } from '@/users/models/user.model';
import { PagedPageArgs } from './dto/paged-page.args';
import { NewPageInput } from './dto/new-page.input';
import { NewPageMetaInput } from './dto/new-page-meta.input';
import { UpdatePageInput } from './dto/update-page.input';
import { Page, PagedPage, PageMeta } from './models/page.model';
import { PostStatusCount, PostDayCount, PostMonthCount, PostYearCount } from '../posts/models/post.model';

@Resolver(() => Page)
export class PageResolver extends createMetaResolver(Page, PageMeta, NewPageMetaInput, PostDataSource, {
  name: '页面',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly postDataSource: PostDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Page, { nullable: true, description: '获取页面' })
  page(@Args('id', { type: () => ID, description: 'Page id' }) id: number, @Fields() fields: ResolveTree) {
    return this.postDataSource.get(id, PostType.Page, this.getFieldNames(fields.fieldsByTypeName.Page));
  }

  @Query((returns) => PagedPage, { description: '获取分页页面列表' })
  pages(@Args() args: PagedPageArgs, @Fields() fields: ResolveTree) {
    return this.postDataSource.getPaged(
      args,
      PostType.Page,
      this.getFieldNames(fields.fieldsByTypeName.PagedPage.rows.fieldsByTypeName.Page),
    );
  }

  @Query((returns) => [PostStatusCount], { description: '获取文章按状态分组数量' })
  pageCountByStatus() {
    return this.postDataSource.getCountByStatus(PostType.Page);
  }

  @Query((returns) => [PostDayCount], { description: '获取文章按天分组数量' })
  pageCountByDay(@Args('month', { description: '月份，格式：yyyyMM' }) month: string) {
    return this.postDataSource.getCountByDay(month, PostType.Page);
  }

  @Query((returns) => [PostMonthCount], { description: '获取文章按月分组数量' })
  pageCountByMonth(
    @Args('year', { nullable: true, description: '年份，格式：yyyy' }) year: string,
    @Args('months', {
      type: () => Int,
      nullable: true,
      description: '从当前日期向前推多少个月，如果year有值则忽略，默认：12',
    })
    months: number,
  ) {
    return this.postDataSource.getCountByMonth({ year, months }, PostType.Page);
  }

  @Query((returns) => [PostYearCount], { description: '获取文章按年分组数量' })
  pageCountByYear() {
    return this.postDataSource.getCountByYear(PostType.Page);
  }

  @Authorized()
  @ResolveField((returns) => User, { description: '作者' })
  author(
    @Root() { author: authorId }: { author: number },
    @Fields() fields: ResolveTree,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSource.get(authorId, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
  }

  @Authorized()
  @Mutation((returns) => Page, { nullable: true, description: '添加页面（不可添加为 Trash 状态，否则无法直接修改）' })
  addPage(@Args('model', { type: () => NewPageInput }) model: NewPageInput, @Context('user') requestUser: JwtPayload) {
    return this.postDataSource.create(model, PostType.Page, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改页面（Trash 状态下不支持修改）' })
  updatePage(
    @Args('id', { type: () => ID, description: 'Page id' }) id: number,
    @Args('model', { type: () => UpdatePageInput }) model: UpdatePageInput,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.postDataSource.update(id, model, requestUser);
  }

  // 修改状态，删除共用Post方法
}
