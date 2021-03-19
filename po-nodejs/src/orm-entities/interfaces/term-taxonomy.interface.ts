import { Optional } from './optional.interface';

export interface TermTaxonomyAttributes {
  id: number;
  termId: number;
  taxonomy: string;
  description: string;
  parentId: number;
  count: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermTaxonomyCreationAttributes extends Optional<TermTaxonomyAttributes, 'id' | 'parentId' | 'count'> {}
