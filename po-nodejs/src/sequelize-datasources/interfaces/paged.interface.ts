export interface PagedArgs {
  offset: number;
  limit: number;
}

export interface Paged<T> {
  rows: T[];
  total: number;
}
