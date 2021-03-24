import { Optional } from './optional.interface';

export interface TermMetaAttributes {
  id: number;
  termId: number;
  metaKey: string;
  metaValue: string;
  description?: string;
  private: 'yes' | 'no';
}

export interface TermMetaCreationAttributes extends Optional<TermMetaAttributes, 'id' | 'private'> {}
