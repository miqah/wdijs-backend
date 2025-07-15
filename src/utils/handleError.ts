export function handleError(error: unknown, customMessage: string = ''): Error {
  if (error instanceof Error) {
    // Handle standard error
    console.error(`${customMessage}: ${error.message}`);
    return error; // Return the error
  } else {
    // Handle non-Error objects (this could be a network error, etc.)
    console.error(`${customMessage}: Unexpected error`, error);
    return new Error(customMessage || 'An unexpected error occurred'); // Return a new error
  }
}
