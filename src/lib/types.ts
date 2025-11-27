export type AppError = {
  message: string;
};

export interface Entity {
  id: string | number;
  createdAt?: string | number;
  updatedAt?: string | number;
}

export type Response<T> = Promise<[AppError, null] | [null, T]>;

export interface PaginationResult<T> {
  items: Array<T>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export enum PaginationLimit {
  SMALL = 5,
  DEFAULT = 10,
  LARGE = 20,
}

export type SearchProps = {
  query?: string;
  limit: number;
  offset: number;
  sortBy: SortOption;
};
