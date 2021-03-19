import { Optional } from './optional.interface';

export interface MediaAttributes {
  id: number;
  fileName: string;
  originalFileName: string;
  extention: string;
  mimeType: string;
  path: string;
  userId: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MediaCreationAttributes extends Optional<MediaAttributes, 'id' | 'userId'> {}
