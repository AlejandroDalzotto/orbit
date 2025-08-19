export type AppError = {
  msg: string
}

export type Response<T> = Promise<[AppError, null] | [null, T]>;