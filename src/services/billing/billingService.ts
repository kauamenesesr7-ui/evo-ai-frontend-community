import apiAuth from '@/services/core/apiAuth';
import { extractData } from '@/utils/apiHelpers';

export interface BillingPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  frequency: number;
  frequency_type: string;
  features: string[];
}

export interface BillingSubscription {
  id: string;
  status: string;
  checkout_url?: string;
  current_period_end?: string;
  plan: BillingPlan;
}

export interface BillingDetails {
  account: {
    name: string;
    subscription_status: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
  };
  subscription?: BillingSubscription;
  plans: BillingPlan[];
}

export const billingService = {
  async show(): Promise<BillingDetails> {
    return extractData<BillingDetails>(await apiAuth.get('/billing'));
  },

  async checkout(planId: string): Promise<BillingSubscription> {
    return extractData<BillingSubscription>(await apiAuth.post('/billing/checkout', { plan_id: planId }));
  },

  async cancel(subscriptionId: string): Promise<BillingSubscription> {
    return extractData<BillingSubscription>(
      await apiAuth.post('/billing/cancel', { subscription_id: subscriptionId }),
    );
  },
};
