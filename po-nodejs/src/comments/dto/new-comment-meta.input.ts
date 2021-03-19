import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { CommentMetaCreationAttributes } from '@/orm-entities/interfaces/comment-meta.interface';

@InputType({ description: '评论元数据新建模型' })
export class NewCommentMetaInput extends NewMetaInput implements CommentMetaCreationAttributes {
  @Field(() => ID, { description: 'Comment Id' })
  commentId!: number;
}
