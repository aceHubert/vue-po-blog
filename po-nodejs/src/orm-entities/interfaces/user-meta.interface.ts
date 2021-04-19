import { Optional } from './optional.interface';

export interface UserMetaAttributes {
  id: number;
  userId: number;
  metaKey: string;
  metaValue: string | null;
}

export interface UserMetaCreationAttributes extends Optional<UserMetaAttributes, 'id'> {}
