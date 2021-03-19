import { Optional } from './optional.interface';

export interface TermAttributes {
  id: number;
  name: string;
  slug: string;
  group: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermCreationAttributes extends Optional<TermAttributes, 'id' | 'group'> {}
