import DataLoader from 'dataloader';
import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { CommentDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { UserSimpleModel } from '@/sequelize-datasources/interfaces';
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
  private userLoader!: DataLoader<{ userId: number; fields: string[] }, UserSimpleModel>;

  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly commentDataSource: CommentDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
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

  @Query((returns) => Comment, { nullable: true, description: 'Get comment.' })
  comment(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree): Promise<Comment | null> {
    const _field = this.getFieldNames(fields.fieldsByTypeName.Comment);
    // graphql 字段与数据库字段不相同
    if (_field.includes('user')) {
      _field.push('userId');
    }

    return this.commentDataSource.get(id, _field);
  }

  @Query((returns) => PagedComment, { description: 'Get paged comments.' })
  comments(@Args() args: PagedCommentArgs, @Fields() fields: ResolveTree) {
    const _field = this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment);
    // graphql 字段与数据库字段不相同
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
    // graphql 字段与数据库字段不相同
    if (_field.includes('user')) {
      _field.push('userId');
    }
    return this.commentDataSource.getPaged({ ...args, parentId }, _field);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'User info' })
  user(@Parent() { userId }: { userId: number }, @Fields() fields: ResolveTree): Promise<SimpleUser | null> {
    return this.userLoader.load({ userId, fields: this.getFieldNames(fields.fieldsByTypeName.SimpleUser) });
  }

  @Authorized()
  @Mutation((returns) => Comment, { description: 'Create a new comment.' })
  createComment(@Args('model') model: NewCommentInput, @User() requestUser: RequestUser): Promise<Comment> {
    return this.commentDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update comment' })
  updateComment(
    @Args('id', { type: () => ID, description: 'Comment id' }) id: number,
    @Args('model') model: UpdateCommentInput,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.commentDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete comment permanently.' })
  deleteComment(
    @Args('id', { type: () => ID, description: 'Comment id' }) id: number,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.commentDataSource.delete(id, requestUser);
  }
}
