export type AppError = {
  msg: string
}

export type Response<T> = Promise<[AppError, null] | [null, T]>;

export interface PaginationResult<T> {
  items: Array<T>,
  total: number,
  page: number,
  limit: number,
  totalPages: number,
  hasNext: boolean,
  hasPrevious: boolean,
}

export type SortOption = "latest" | "oldest" | "balance" | "income" | "expenses"