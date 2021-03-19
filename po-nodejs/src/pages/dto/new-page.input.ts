import { Field, InputType } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { PostCreationAttributes } from '@/orm-entities/interfaces/posts.interface';

@InputType({ description: '页面新建模型' })
export class NewPageInput implements PostCreationAttributes {
  @Field({ description: '标题' })
  public title!: string;

  @Field({ nullable: true, description: '唯一标识，用于 Url 显示' })
  public name?: string;

  @Field({ description: '内容' })
  public content!: string;

  @Field((type) => [NewMetaInput!], { nullable: true, description: '页面元数据' })
  public metas?: NewMetaInput[];
}
