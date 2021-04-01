export type Term = {
  id: string;
  taxonomyId: string;
  name: string;
  slug: string;
  description: string;
  count: string;
  group: number;
  children: Term[];
};

export type TermRelationship = {
  objectId: string;
  taxonomyId: string;
  order: number;
};

export type TermCreationModel = {
  name: string;
  slug?: string;
  taxonomy: string;
  objectId?: string;
};

export type TermRelationshipCreationModel = {
  objectId: string;
  taxonomyId: string;
  order?: number;
};

export type TermUpdateModel = Partial<TermCreationModel>;

export type TermQuery = {
  keywords?: string;
};

export type TermResponse = Term[];
