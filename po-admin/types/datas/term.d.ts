export type Term = {
  id: string;
  taxonomyId: string;
  name: string;
  slug: string;
  description: string;
  count: string;
  group: number;
  parentId: string;
  children?: Term[];
};

export type TermRelationship = {
  objectId: string;
  taxonomyId: string;
  order: number;
};

export type TermCreationModel = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
};

export type TermRelationshipCreationModel = {
  objectId: string;
  taxonomyId: string;
  order?: number;
};

export type TermUpdateModel = Partial<TermCreationModel>;

export type TermQuery = {
  keyword?: string;
};
