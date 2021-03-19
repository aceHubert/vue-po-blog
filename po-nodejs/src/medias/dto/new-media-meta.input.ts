import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { MediaMetaCreationAttributes } from '@/orm-entities/interfaces/media-meta.interface';

@InputType({ description: '媒体元数据新建模型' })
export class NewMediaMetaInput extends NewMetaInput implements MediaMetaCreationAttributes {
  @Field(() => ID, { description: 'Media Id' })
  mediaId!: number;
}
