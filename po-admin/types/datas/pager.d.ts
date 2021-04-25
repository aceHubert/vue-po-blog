export type PagerQuery<T extends Record<string, any>> = {
  offset?: number;
  limit?: number;
} & T;

export type PagerResponse<T extends Record<string, any>> = {
  rows: T[];
  total: number;
};
