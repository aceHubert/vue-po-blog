import { Field, ObjectType, InputType, ArgsType, ID } from 'type-graphql';
import { PagedQueryArgs, PagedResponse } from './general';
import Meta, { MetaAddModel } from './meta';

// Types
import { MediaCreationAttributes } from '@/dataSources/entities/medias';
import { MediaMetaCreationAttributes } from '@/dataSources/entities/mediaMeta';

@ObjectType({ description: '媒体模型' })
export default class Media {
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

/**
 * 媒体查询分页参数
 */
@ArgsType()
export class PagedMediaQueryArgs extends PagedQueryArgs {
  @Field({ nullable: true, description: '文件后缀' })
  extention?: string;

  @Field({ nullable: true, description: '媒体类型' })
  mimeType?: string;
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

@InputType({ description: '媒体元数据新建模型' })
export class MediaMetaAddModel extends MetaAddModel implements MediaMetaCreationAttributes {
  @Field(() => ID, { description: 'Media Id' })
  mediaId!: number;
}

@InputType({ description: '媒体新建模型' })
export class MediaAddModel implements MediaCreationAttributes {
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

  @Field(() => ID, { nullable: true, description: 'User Id' })
  userId?: number;

  @Field((type) => [MetaAddModel], { nullable: true, description: '媒体元数据' })
  metas?: MetaAddModel[];
}
