import { Optional } from './optional.interface';

export interface UserMetaAttributes {
  id: number;
  userId: number;
  metaKey: string;
  metaValue?: string;
}

export interface UserMetaCreationAttributes extends Optional<UserMetaAttributes, 'id'> {}
