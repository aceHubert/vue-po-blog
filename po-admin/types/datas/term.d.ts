export type Term = {
  taxonomyId: number;
  termId: number;
  name: string;
  slug: string;
  description: string;
  count: string;
  group: number;
  children: Term[];
};

export type TermRelationship = {
  objectId: number;
  taxonomyId: number;
  order: number;
};

export type TermCreationModel = {
  name: string;
  slug: string;
  taxonomy: string;
  objectId?: number;
};

export type TermRelationshipCreationModel = {
  objectId: number;
  taxonomyId: number;
  order?: number;
};

export type TermUpdateModel = Partial<TermCreationModel>;
