// The server answered with an error status (400, 401, 404, 500, …)
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMessage?: string, // the API's { message } field, if any
  ) {
    super(serverMessage ?? `HTTP ${status}`);
    this.name = 'HttpError';
  }
}

// No response at all: no internet, wrong IP, firewall, server not running
export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}

// The request was sent but took longer than the allowed time
export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

// The server answered successfully, but with data the app can't use
export class InvalidResponseError extends Error {
  constructor(public readonly reason: string) {
    super(`Invalid response: ${reason}`);
    this.name = 'InvalidResponseError';
  }
}
