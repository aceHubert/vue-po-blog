import { Optional } from './optional.interface';

export interface TermRelationshipAttributes {
  objectId: number;
  taxonomyId: number;
  order: number;
}

export interface TermRelationshipCreationAttributes extends Optional<TermRelationshipAttributes, 'order'> {}
