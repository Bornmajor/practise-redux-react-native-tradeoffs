import type { AxiosInstance } from 'axios';
import type { ListResponse, OneResponse, SubscriptionWriteDto, WriteResponse } from './subscription.dto';

// The contract the repository depends on: raw API data, no mapping, no error translation
export interface SubscriptionRemote {
  getAll(): Promise<unknown[]>;
  getById(id: string): Promise<unknown>;
  create(body: SubscriptionWriteDto): Promise<unknown>;
  upsert(id: string, body: SubscriptionWriteDto): Promise<WriteResponse>; // keeps `applied`
  remove(id: string): Promise<void>;
}

// The implementation that talks to the API through Axios
export class AxiosSubscriptionRemote implements SubscriptionRemote {
  // Constructor injection: the configured Axios instance is passed in
  constructor(private readonly http: AxiosInstance) {}

  // encodeURIComponent: an ID can never break the URL
  private path(id: string) {
    return `/subscriptions/${encodeURIComponent(id)}`;
  }

  async getAll() {
    const { data } = await this.http.get<ListResponse>('/subscriptions');
    return data.subscriptions;
  }

  async getById(id: string) {
    const { data } = await this.http.get<OneResponse>(this.path(id));
    return data.subscription;
  }

  async create(body: SubscriptionWriteDto) {
    const { data } = await this.http.post<WriteResponse>('/subscriptions', body);
    return data.subscription;
  }

  async upsert(id: string, body: SubscriptionWriteDto) {
    const { data } = await this.http.put<WriteResponse>(this.path(id), body);
    return data; // the repository needs `applied` too
  }

  async remove(id: string) {
    // Axios sends a DELETE body through the `data` option
    await this.http.delete(this.path(id), { data: { updatedAt: new Date().toISOString() } });
  }
}
