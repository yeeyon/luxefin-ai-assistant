export interface ApiError {
  message: string
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return { message: String((error as { message: unknown }).message) }
  }

  return { message: "An unexpected error occurred" }
}

export function toError(error: unknown): Error {
  const { message } = handleApiError(error)
  return new Error(message)
}
