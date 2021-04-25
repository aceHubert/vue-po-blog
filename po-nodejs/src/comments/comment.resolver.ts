import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { CommentDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { SimpleUser } from '@/users/models/user.model';
import { PagedCommentArgs, PagedCommentChildrenArgs } from './dto/paged-comment.args';
import { NewCommentInput } from './dto/new-comment.input';
import { NewCommentMetaInput } from './dto/new-comment-meta.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment, PagedComment, CommentMeta } from './models/comment.model';

@Resolver(() => Comment)
export class CommentResolver extends createMetaResolver(Comment, CommentMeta, NewCommentMetaInput, CommentDataSource, {
  description: '文章评论',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly commentDataSource: CommentDataSource,
    private readonly userDataSoruce: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Comment, { nullable: true, description: '获取评论' })
  comment(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree): Promise<Comment | null> {
    let fixFields = this.getFieldNames(fields.fieldsByTypeName.Comment);
    if (fixFields.includes('user')) {
      fixFields = ['userId'].concat(fixFields);
    }

    return this.commentDataSource.get(id, fixFields);
  }

  @Query((returns) => PagedComment, { description: '获取评论分页列表' })
  comments(@Args() args: PagedCommentArgs, @Fields() fields: ResolveTree) {
    return this.commentDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment),
    );
  }

  @ResolveField((returns) => PagedComment, { description: '回复的评论（分页）' })
  children(
    @Args() args: PagedCommentChildrenArgs,
    @Parent() { id: parentId }: { id: number },
    @Fields() fields: ResolveTree,
  ) {
    return this.commentDataSource.getPaged(
      { ...args, parentId },
      this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment),
    );
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: '评论用户' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userDataSoruce.getSimpleInfo(userId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Comment, { description: '添加评论' })
  addComment(@Args('model', { type: () => NewCommentInput }) model: NewCommentInput): Promise<Comment> {
    return this.commentDataSource.create(model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改评论' })
  modifyComment(
    @Args('id', { type: () => ID, description: 'Comment id' }) id: number,
    @Args('model', { type: () => UpdateCommentInput }) model: UpdateCommentInput,
  ): Promise<boolean> {
    return this.commentDataSource.update(id, model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '删除评论' })
  removeComment(@Args('id', { type: () => ID, description: 'Comment id' }) id: number): Promise<boolean> {
    return this.commentDataSource.delete(id);
  }
}
