import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PagedResponse } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';

@ObjectType({ description: '媒体模型' })
export class Media {
  @Field(() => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '文件名' })
  fileName!: string;

  @Field({ description: '原始文件名' })
  originalFileName!: string;

  @Field({ description: '文件后缀' })
  extention!: string;

  @Field({ description: '媒体类型' })
  mimeType!: string;

  @Field({ description: '相对路径' })
  path!: string;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

@ObjectType({ description: '媒体分页模型' })
export class PagedMedia extends PagedResponse(Media) {
  // other fields
}

@ObjectType({ description: '媒体元数据模型' })
export class MediaMeta extends Meta {
  @Field((type) => ID, { description: 'Media Id' })
  mediaId!: number;
}
