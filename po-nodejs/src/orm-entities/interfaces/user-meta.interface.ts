import { Optional } from './optional.interface';

export interface UserMetaAttributes {
  id: number;
  userId: number;
  metaKey: string;
  metaValue: string;
  description?: string;
  private: 'yes' | 'no';
}

export interface UserMetaCreationAttributes extends Optional<UserMetaAttributes, 'id' | 'private'> {}
