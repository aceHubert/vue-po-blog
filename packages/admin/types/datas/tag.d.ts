export type Tag = {
  id: number;
  name: string;
};

export type CreateTagModel = {
  name: string;
};

export type UpdateTagModel = CreateTagModel & {
  id: number;
};

export interface TagApi {
  getList(): Promise<Tag[]>;
  get(id: number): Promise<Tag | null>;
  create(data: CreateTagModel): Promise<Tag>;
  update(data: UpdateTagModel): Promise<true>;
  delete(id: number): Promise<true>;
}
