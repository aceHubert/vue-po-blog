import { Optional } from './optional.interface';

export interface TermMetaAttributes {
  id: number;
  termId: number;
  metaKey: string;
  metaValue?: string;
}

export interface TermMetaCreationAttributes extends Optional<TermMetaAttributes, 'id'> {}
