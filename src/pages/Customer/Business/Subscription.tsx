import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@evoapi/design-system';
import { Check, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BaseHeader } from '@/components/base';
import {
  billingService,
  type BillingDetails,
  type BillingPlan,
} from '@/services/billing/billingService';

const statusLabel: Record<string, string> = {
  trialing: 'Período de teste',
  active: 'Ativa',
  authorized: 'Ativa',
  pending: 'Aguardando pagamento',
  past_due: 'Pagamento pendente',
  paused: 'Pausada',
  canceled: 'Cancelada',
  expired: 'Expirada',
};

export default function Subscription() {
  const [details, setDetails] = useState<BillingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setDetails(await billingService.show());
    } catch {
      toast.error('Não foi possível carregar os dados da assinatura.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const checkout = async (plan: BillingPlan) => {
    setProcessing(plan.id);
    try {
      const subscription = await billingService.checkout(plan.id);
      if (!subscription.checkout_url) throw new Error('Checkout sem URL');
      window.location.assign(subscription.checkout_url);
    } catch {
      toast.error('Não foi possível iniciar o checkout do Mercado Pago.');
      setProcessing(null);
    }
  };

  const cancel = async () => {
    if (!details?.subscription || !window.confirm('Deseja cancelar a assinatura recorrente?')) return;
    setProcessing(details.subscription.id);
    try {
      await billingService.cancel(details.subscription.id);
      toast.success('Assinatura cancelada.');
      await load();
    } catch {
      toast.error('Não foi possível cancelar a assinatura.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Carregando assinatura...</div>;
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      <BaseHeader title="Assinatura" subtitle="Gerencie o plano da sua empresa e a cobrança recorrente pelo Mercado Pago." />

      {details && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-semibold">{details.account.name}</span>
                <Badge>{statusLabel[details.account.subscription_status] || details.account.subscription_status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {details.account.trial_ends_at && details.account.subscription_status === 'trialing'
                  ? `Teste disponível até ${new Date(details.account.trial_ends_at).toLocaleDateString('pt-BR')}.`
                  : details.subscription?.current_period_end
                    ? `Próxima renovação: ${new Date(details.subscription.current_period_end).toLocaleDateString('pt-BR')}.`
                    : 'Escolha um plano para liberar o acesso completo.'}
              </p>
            </div>
            {details.subscription && ['authorized', 'active', 'pending'].includes(details.subscription.status) && (
              <Button variant="outline" onClick={cancel} disabled={Boolean(processing)}>Cancelar renovação</Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {details?.plans.map(plan => (
          <Card key={plan.id} className="relative flex flex-col border-primary/20 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="pt-3">
                <span className="text-3xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: plan.currency }).format(plan.price)}
                </span>
                <span className="text-sm text-muted-foreground"> / mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-3">
                {(plan.features || []).map(feature => (
                  <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{feature}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full" onClick={() => checkout(plan)} disabled={Boolean(processing)}>
                {processing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assinar com Mercado Pago
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
