export interface MetaModel {
  id: number;
  metaKey: string;
  metaValue: string | null;
}

export interface NewMetaInput {
  metaKey: string;
  metaValue: string | null;
}
