import {
  TermAttributes,
  TermCreationAttributes,
  TermTaxonomyAttributes,
  TermTaxonomyCreationAttributes,
  TermRelationshipAttributes,
  TermRelationshipCreationAttributes,
} from '@/orm-entities/interfaces';
import { MetaModel, NewMetaInput } from './meta.interface';

/**
 * 协议元数据实体
 */
export interface TermMetaModel extends MetaModel {
  termId: number;
}

/**
 * 协议（类别）实体
 */
export interface TermTaxonomyModel extends TermAttributes, Omit<TermTaxonomyAttributes, 'id' | 'termId'> {
  /**
   * TermTaxonomy.id => taxonomyId
   */
  taxonomyId: number;
}

/**
 * 协议关系
 */
export interface TermRelationshipModel extends TermRelationshipAttributes {}

/**
 * 协议（类别）搜索条件
 */
export interface TermTaxonomyArgs {
  taxonomy: string;
  parentId?: number;
  keyword?: string;
  group?: number;
}

/**
 * 协议关系搜索条件
 */
export interface TermTaxonomyByObjectIdArgs {
  objectId: number;
  taxonomy: string;
  parentId?: number;
  group?: number;
  desc?: boolean;
}

/**
 * 新建协议（类别）实体
 */
export interface NewTermInput
  extends Pick<TermCreationAttributes, 'name' | 'group'>,
    Pick<TermTaxonomyCreationAttributes, 'taxonomy' | 'parentId' | 'description'> {
  /**
   * 可为空，不填将以name填充
   */
  slug?: string;
  /**
   * 如果有值，则自动绑定关系
   */
  objectId?: number;
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

/**
 * 新建协议元数据实体
 */
export interface NewTermMetaInput extends NewMetaInput {
  termId: number;
}

/**
 * 新建协议关系实体
 */
export interface NewTermRelationshipInput extends TermRelationshipCreationAttributes {}

/**
 * 修改协议模型
 */
export interface UpdateTermInput
  extends Partial<Pick<NewTermInput, 'name' | 'slug' | 'description' | 'parentId' | 'group'>> {}
