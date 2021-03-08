import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID, Int } from 'type-graphql';
import { PostType } from '@/dataSources';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import User from '@/model/user';
import Page, {
  PagedPageQueryArgs,
  PagedPage,
  PageAddModel,
  PageUpdateModel,
  PageMeta,
  PageMetaAddModel,
} from '@/model/page';

import { PostStatusCount, PostDayCount, PostMonthCount, PostYearCount } from '@/model/post';

// Types
import { DataSources } from '../dataSources';

@Resolver((returns) => Page)
export default class PageResolver extends createMetaResolver(Page, PageMeta, PageMetaAddModel, {
  dataSourceKey: 'post',
  name: '页面',
}) {
  @Query((returns) => Page, { nullable: true, description: '获取页面' })
  page(@Arg('id', (type) => ID!) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.get(id, PostType.Page, this.getFieldNames(fields.fieldsByTypeName.Page));
  }

  @Query((returns) => PagedPage, { description: '获取分页页面列表' })
  pages(@Args() args: PagedPageQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.getPaged(
      args,
      PostType.Page,
      this.getFieldNames(fields.fieldsByTypeName.PagedPage.rows.fieldsByTypeName.Page),
    );
  }

  @Query((returns) => [PostStatusCount], { description: '获取文章按状态分组数量' })
  pageCountByStatus(@Ctx('dataSources') { post }: DataSources) {
    return post.getCountByStatus(PostType.Page);
  }

  @Query((returns) => [PostDayCount], { description: '获取文章按天分组数量' })
  pageCountByDay(
    @Arg('month', { description: '月份，格式：yyyyMM' }) month: string,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.getCountByDay(month, PostType.Page);
  }

  @Query((returns) => [PostMonthCount], { description: '获取文章按月分组数量' })
  pageCountByMonth(
    @Arg('year', { nullable: true, description: '年份，格式：yyyy' }) year: string,
    @Arg('months', (type) => Int, {
      nullable: true,
      description: '从当前日期向前推多少个月，如果year有值则忽略，默认：12',
    })
    months: number,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.getCountByMonth({ year, months }, PostType.Page);
  }

  @Query((returns) => [PostYearCount], { description: '获取文章按年分组数量' })
  pageCountByYear(@Ctx('dataSources') { post }: DataSources) {
    return post.getCountByYear(PostType.Page);
  }

  @FieldResolver((returns) => User, { description: '作者' })
  author(@Root('author') authorId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(authorId, this.getFieldNames(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Page, { nullable: true, description: '添加页面（不可添加为 Trash 状态，否则无法直接修改）' })
  addPage(@Arg('model', (type) => PageAddModel) model: PageAddModel, @Ctx('dataSources') { post }: DataSources) {
    return post.create(model, PostType.Page);
  }

  @Mutation((returns) => Boolean, { description: '修改页面（Trash 状态下不支持修改）' })
  updatePage(
    @Arg('id', (type) => ID) id: number,
    @Arg('model', (type) => PageUpdateModel) model: PageUpdateModel,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.update(id, model);
  }

  // 修改状态，删除共用Post方法
}
