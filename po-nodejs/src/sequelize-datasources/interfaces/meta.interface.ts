export interface MetaModel {
  id: number;
  metaKey: string;
  metaValue: string;
  description?: string;
}

export interface NewMetaInput {
  metaKey: string;
  metaValue: string;
  description?: string;
}
