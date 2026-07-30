import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';

export type BusinessResource =
  | 'rentals'
  | 'financial_entries'
  | 'business_reminders'
  | 'contracts';

export type BusinessRecord = Record<string, unknown> & { id: string };

export const businessService = {
  async list(resource: BusinessResource): Promise<BusinessRecord[]> {
    return extractData<BusinessRecord[]>(await api.get(`/${resource}`));
  },

  async create(
    resource: BusinessResource,
    rootKey: string,
    payload: Record<string, unknown>,
  ): Promise<BusinessRecord> {
    return extractData<BusinessRecord>(await api.post(`/${resource}`, { [rootKey]: payload }));
  },

  async update(
    resource: BusinessResource,
    rootKey: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<BusinessRecord> {
    return extractData<BusinessRecord>(
      await api.patch(`/${resource}/${id}`, { [rootKey]: payload }),
    );
  },

  async remove(resource: BusinessResource, id: string): Promise<void> {
    await api.delete(`/${resource}/${id}`);
  },

  async action(
    resource: BusinessResource,
    id: string,
    action: string,
    payload: Record<string, unknown> = {},
  ): Promise<BusinessRecord> {
    return extractData<BusinessRecord>(await api.post(`/${resource}/${id}/${action}`, payload));
  },

  async overview<T>(): Promise<T> {
    return extractData<T>(await api.get('/business_overview'));
  },

  contractPdfUrl(id: string): string {
    return `${import.meta.env.VITE_API_URL}/api/v1/contracts/${id}/pdf`;
  },
};
