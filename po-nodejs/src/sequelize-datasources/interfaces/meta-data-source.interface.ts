// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IMetaDataSource<MetaModelType, NewMetaInputType> {
  getMetas(modelId: number, metaKeys: string[] | undefined, fields: string[]): Promise<MetaModelType[]>;
  isMetaExists(modelId: number, metaKey: string): Promise<boolean>;
  createMeta(model: NewMetaInputType): Promise<MetaModelType | false>;
  updateMeta(id: number, metaValue: string): Promise<boolean>;
  updateMetaByKey(modelId: number, metaKey: string, metaValue: string): Promise<boolean>;
  deleteMeta(id: number): Promise<boolean>;
}
