import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID } from 'type-graphql';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User from '@/model/user';
import Comment, {
  PagedCommentQueryArgs,
  ChildPagedCommentQueryArgs,
  PagedComment,
  CommentAddModel,
  CommentMeta,
  CommentMetaAddModel,
} from '@/model/comment';

@Resolver((returns) => Comment)
export default class CommentResolver extends createMetaResolver(Comment, CommentMeta, CommentMetaAddModel, {
  name: '评论',
}) {
  @Query((returns) => Comment, { nullable: true, description: '获取评论' })
  comment(
    @Arg('id', (type) => ID!) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { comment }: DataSources,
  ) {
    let fixFields = Object.keys(fields.fieldsByTypeName.Comment);
    if (fixFields.includes('user')) {
      fixFields = ['userId'].concat(fixFields);
    }
    if (fixFields.includes('children') && !fixFields.includes('id')) {
      fixFields = ['id'].concat(fixFields);
    }

    return comment.get(id, fixFields);
  }

  @Query((returns) => PagedComment, { description: '获取评论分页列表' })
  comments(
    @Args() args: PagedCommentQueryArgs,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { comment }: DataSources,
  ) {
    return comment.getPaged(args, Object.keys(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment));
  }

  @FieldResolver((returns) => PagedComment, { description: '回复的评论（分页）' })
  children(
    @Args() args: ChildPagedCommentQueryArgs,
    @Root('id') parentId: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { comment }: DataSources,
  ) {
    const fixArgs: Omit<PagedCommentQueryArgs, 'postId'> = {
      ...args,
      parentId,
    };
    return comment.getPaged(fixArgs, Object.keys(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment));
  }

  @FieldResolver((returns) => User, { nullable: true, description: '评论用户' })
  user(@Root('userId') userId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(userId, Object.keys(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Comment, {
    nullable: true,
    description: '添加评论',
  })
  addComment(
    @Arg('model', (type) => CommentAddModel) model: CommentAddModel,
    @Ctx('dataSources') { comment }: DataSources,
  ) {
    return comment.create(model);
  }
}
