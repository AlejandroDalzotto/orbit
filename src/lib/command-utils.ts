import type { ErrorPayload } from "../types/generated/ErrorPayload";

function isErrorPayload(error: unknown): error is ErrorPayload {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string";
}

export function normalizeCommandError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  if (isErrorPayload(error)) return new Error(error.message);
  return new Error("Error desconocido al ejecutar el comando.");
}
