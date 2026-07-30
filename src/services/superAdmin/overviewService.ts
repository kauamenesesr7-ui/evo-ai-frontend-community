import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';

export interface SuperAdminOverview {
  summary: {
    tenants: number;
    active_tenants: number;
    users: number;
    whatsapp_connections: number;
    conversations: number;
    messages: number;
    ai_agents: number;
    storage_attachments: number;
  };
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    subscription_status: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
    usage: {
      users: number;
      inboxes: number;
      conversations: number;
      messages: number;
    };
  }>;
  health: Record<string, { status: string; connections?: number }>;
  capacity: {
    current_server: { vcpu: number; memory_gb: number; observed_memory_percent: number };
    safe_commercial_range: { minimum_tenants: number; maximum_tenants: number };
    light_load_uncommitted_ceiling: number;
    recommended_for_25_tenants: { vcpu: number; memory_gb: number };
  };
  recent_activity: {
    messages_last_24h: number;
    conversations_last_24h: number;
    rentals_last_30d: number;
  };
}

export const superAdminOverviewService = {
  async get(): Promise<SuperAdminOverview> {
    return extractData<SuperAdminOverview>(await api.get('/super_admin/overview'));
  },
};
