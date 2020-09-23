export type PagerQuery<T extends Record<string, any>> = {
  page?: number;
  size?: number;
} & T;
