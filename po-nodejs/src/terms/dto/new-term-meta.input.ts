import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { TermMetaCreationAttributes } from '@/orm-entities/interfaces/term-meta.interface';

@InputType({ description: '协议元数据新建模型' })
export class NewTermMetaInput extends NewMetaInput implements TermMetaCreationAttributes {
  @Field(() => ID, { description: 'Term Id' })
  termId!: number;
}
