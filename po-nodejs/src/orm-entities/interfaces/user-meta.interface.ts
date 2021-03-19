import { Optional } from './optional.interface';

export interface UserMetaAttributes {
  id: number;
  userId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserMetaCreationAttributes extends Optional<UserMetaAttributes, 'id' | 'private'> {}
