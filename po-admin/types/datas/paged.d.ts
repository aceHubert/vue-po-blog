export type PagedQuery<T extends Record<string, any>> = {
  offset?: number;
  limit?: number;
} & T;

export type PagedResponse<T extends Record<string, any>> = {
  rows: T[];
  total: number;
};
