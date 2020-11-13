export type Category = {
  id: number;
  name: string;
};

export type CreateCategoryModel = {
  name: string;
};

export type UpdateCategoryModel = CreateCategoryModel & {
  id: number;
};

export interface CategoryApi {
  getList(): Promise<Category[]>;
  get(id: number): Promise<Category | null>;
  create(data: CreateCategoryModel): Promise<Category>;
  update(data: UpdateCategoryModel): Promise<true>;
  delete(id: number): Promise<true>;
}
