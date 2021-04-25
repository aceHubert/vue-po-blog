import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PagedResponse } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';

@ObjectType({ description: 'Media model' })
export class Media {
  @Field(() => ID, { description: 'Media id' })
  id!: number;

  @Field({ description: 'Finename' })
  fileName!: string;

  @Field({ description: 'Original filename' })
  originalFileName!: string;

  @Field({ description: 'File extention' })
  extention!: string;

  @Field({ description: 'File mime type' })
  mimeType!: string;

  @Field({ description: 'File relative path' })
  path!: string;

  @Field({ description: 'Creation time' })
  createdAt!: Date;
}

@ObjectType({ description: 'Media paged model' })
export class PagedMedia extends PagedResponse(Media) {
  // other fields
}

@ObjectType({ description: 'Media meta model' })
export class MediaMeta extends Meta {
  @Field((type) => ID, { description: 'Media Id' })
  mediaId!: number;
}
