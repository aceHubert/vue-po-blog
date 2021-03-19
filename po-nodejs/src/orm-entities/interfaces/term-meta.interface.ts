import { Optional } from './optional.interface';

export interface TermMetaAttributes {
  id: number;
  termId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermMetaCreationAttributes extends Optional<TermMetaAttributes, 'id' | 'private'> {}
