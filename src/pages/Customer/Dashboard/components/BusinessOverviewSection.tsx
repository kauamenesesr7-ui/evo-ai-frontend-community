import { useEffect, useState } from 'react';
import { Card, CardContent } from '@evoapi/design-system';
import { BellRing, CalendarDays, FileSignature, Loader2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { businessService } from '@/services/business/businessService';

interface Overview {
  rentals: { upcoming: number; this_month: number; confirmed: number };
  finance: { receivable: number; payable: number; received_this_month: number; overdue: number };
  reminders: { due: number; upcoming: number };
  contracts: { draft: number; signed: number };
}

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function BusinessOverviewSection() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    businessService.overview<Overview>().then(setOverview).catch(() => setOverview(null));
  }, []);

  if (!overview) {
    return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Carregando visão do negócio...</div>;
  }

  const cards = [
    { label: 'Próximas locações', value: overview.rentals.upcoming, detail: `${overview.rentals.confirmed} confirmadas`, icon: CalendarDays, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'A receber', value: currency(overview.finance.receivable), detail: `${currency(overview.finance.overdue)} vencidos`, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'A pagar', value: currency(overview.finance.payable), detail: `${currency(overview.finance.received_this_month)} recebidos no mês`, icon: TrendingDown, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Lembretes pendentes', value: overview.reminders.due, detail: `${overview.reminders.upcoming} nos próximos 7 dias`, icon: BellRing, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'Contratos assinados', value: overview.contracts.signed, detail: `${overview.contracts.draft} rascunhos`, icon: FileSignature, color: 'text-cyan-500 bg-cyan-500/10' },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <WalletCards className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Visão do negócio</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(card => (
          <Card key={card.label} className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-xl font-bold">{card.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
