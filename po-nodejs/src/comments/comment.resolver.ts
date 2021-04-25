import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
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
  descriptionName: 'comment',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly commentDataSource: CommentDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Comment, { nullable: true, description: 'Get comment.' })
  comment(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree): Promise<Comment | null> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.Comment);
    // field resolve
    if (_field.includes('user')) {
      _field.push('userId');
    }

    return this.commentDataSource.get(id, _field);
  }

  @Query((returns) => PagedComment, { description: 'Get paged comments.' })
  comments(@Args() args: PagedCommentArgs, @Fields() fields: ResolveTree) {
    const _field = this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment);
    // field resolve
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.commentDataSource.getPaged(args, _field);
  }

  @ResolveField((returns) => PagedComment, { description: 'Get cascade paged comments.' })
  children(
    @Args() args: PagedCommentChildrenArgs,
    @Parent() { id: parentId }: { id: number },
    @Fields() fields: ResolveTree,
  ) {
    const _field = this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment);
    // field resolve
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.commentDataSource.getPaged({ ...args, parentId }, _field);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(userId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Comment, { description: 'Create a new comment.' })
  createComment(@Args('model') model: NewCommentInput, @User() requestUser: JwtPayloadWithLang): Promise<Comment> {
    return this.commentDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update comment' })
  updateComment(
    @Args('id', { type: () => ID, description: 'Comment id' }) id: number,
    @Args('model') model: UpdateCommentInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.commentDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete comment permanently.' })
  deleteComment(
    @Args('id', { type: () => ID, description: 'Comment id' }) id: number,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.commentDataSource.delete(id, requestUser);
  }
}
