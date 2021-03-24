import { Field, InputType, Int } from '@nestjs/graphql';

@InputType({ description: '协议修改模型' })
export class UpdateTermInput {
  @Field({ nullable: true, description: 'Name' })
  name?: string;

  @Field({ nullable: true, description: '别名' })
  slug?: string;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;
}
