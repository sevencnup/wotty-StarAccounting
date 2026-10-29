export class CloudRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CloudRequestError";
    this.status = status;
  }
}

export function isCloudAuthenticationFailure(error: unknown) {
  return error instanceof CloudRequestError && error.status === 401;
}
