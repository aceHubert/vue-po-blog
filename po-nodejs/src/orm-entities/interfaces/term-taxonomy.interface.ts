import { Optional } from './optional.interface';

export interface TermTaxonomyAttributes {
  id: number;
  termId: number;
  taxonomy: string;
  description: string;
  parentId: number;
  count: number;
}

export interface TermTaxonomyCreationAttributes extends Optional<TermTaxonomyAttributes, 'id' | 'parentId' | 'count'> {}
