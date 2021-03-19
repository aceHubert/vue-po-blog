import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { CommentCreationAttributes } from '@/orm-entities/interfaces/comments.interface';

@InputType({ description: '评论新建模型' })
export class NewCommentInput implements CommentCreationAttributes {
  @Field(() => ID, { description: '文章 Id' })
  postId!: number;

  @Field({ description: '评论人' })
  author!: string;

  @Field({ nullable: true, description: '评论人 Email' })
  authorEmail?: string;

  @Field({ nullable: true, description: '评论人客户端 Url' })
  authorUrl?: string;

  @Field({ nullable: true, description: '评论人客户端 IP' })
  authorIP?: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ nullable: true, description: '浏览器 UserAgent' })
  agent?: string;

  @Field((type) => ID, { nullable: true, description: '父 Id' })
  parentId?: number;

  @Field((type) => ID, { nullable: true, description: '登录用户 Id' })
  userId?: number;

  @Field((type) => [NewMetaInput!], { nullable: true, description: '文章元数据' })
  metas?: NewMetaInput[];
}
