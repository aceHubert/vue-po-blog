import { Field, InputType } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New media input' })
export class NewMediaInput {
  @Field({ description: 'Filename' })
  fileName!: string;

  @Field({ description: 'Original filename' })
  originalFileName!: string;

  @Field({ description: 'File extension' })
  extension!: string;

  @Field({ description: 'File mime type' })
  mimeType!: string;

  @Field({ description: 'File relative path' })
  path!: string;

  @Field((type) => [NewMetaInput], { nullable: true, description: 'Media metas' })
  metas?: NewMetaInput[];
}
