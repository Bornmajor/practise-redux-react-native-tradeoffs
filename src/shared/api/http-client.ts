import { create, isAxiosError, type AxiosInstance } from 'axios';
import { HttpError, NetworkError, TimeoutError } from './http-errors';

// Settings the client needs (passed in, so tests can use other values)
export type HttpClientConfig = {
  baseUrl: string; // e.g. http://192.168.1.159:5000
  apiKey: string;
  timeoutMs?: number;
};

export function createHttpClient({ baseUrl, apiKey, timeoutMs = 10_000 }: HttpClientConfig): AxiosInstance {
  // INSTANCE: shared settings for every request made with this client
  const http = create({
    baseURL: `${baseUrl}/api`,
    timeout: timeoutMs, // give up after 10s instead of hanging forever
    headers: {
      'x-api-key': apiKey, // the backend's shared key, on every request
      Accept: 'application/json',
    },
  });

  // REQUEST INTERCEPTOR: runs before every request leaves the app
  http.interceptors.request.use((config) => {
    if (__DEV__) {
      console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  });

  // RESPONSE INTERCEPTOR: turn every Axios failure into one of OUR transport errors,
  // so no other file ever needs to know Axios's error format
  http.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError<{ message?: string }>(error)) {
        if (error.response) {
          return Promise.reject(new HttpError(error.response.status, error.response.data?.message));
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return Promise.reject(new TimeoutError());
        }
        return Promise.reject(new NetworkError());
      }
      return Promise.reject(error); // not an Axios error: let it through unchanged
    },
  );

  return http;
}
