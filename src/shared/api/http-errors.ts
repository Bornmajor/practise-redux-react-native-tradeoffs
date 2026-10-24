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

// No response because the DEVICE has no connection (checked with NetInfo)
export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}

// No response although the device IS connected: server down, wrong address, or blocked by a firewall
export class ServerUnreachableError extends Error {
  constructor() {
    super('Server unreachable');
    this.name = 'ServerUnreachableError';
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
