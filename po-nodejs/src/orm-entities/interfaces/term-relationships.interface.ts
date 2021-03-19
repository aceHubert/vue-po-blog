import { Optional } from './optional.interface';

export interface TermRelationshipAttributes {
  objectId: number;
  taxonomyId: number;
  order: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermRelationshipCreationAttributes extends Optional<TermRelationshipAttributes, 'order'> {}
