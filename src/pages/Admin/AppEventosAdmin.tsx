import { useEffect, useState } from 'react';
import {
  Bot,
  Building2,
  CheckCircle2,
  Database,
  HardDrive,
  MessageCircle,
  MessagesSquare,
  Server,
  Users,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evoapi/design-system';
import {
  SuperAdminOverview,
  superAdminOverviewService,
} from '@/services/superAdmin/overviewService';
import { ApiKeysModal } from '@/components/ApiKeysModal';
import { Button } from '@evoapi/design-system';

const summaryCards = [
  ['Empresas', 'tenants', Building2],
  ['Usuários', 'users', Users],
  ['WhatsApps', 'whatsapp_connections', MessageCircle],
  ['Conversas', 'conversations', MessagesSquare],
  ['Mensagens', 'messages', Database],
  ['Agentes IA', 'ai_agents', Bot],
  ['Anexos', 'storage_attachments', HardDrive],
] as const;

const number = new Intl.NumberFormat('pt-BR');

const AppEventosAdmin = () => {
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [error, setError] = useState('');
  const [aiProfilesOpen, setAiProfilesOpen] = useState(false);

  useEffect(() => {
    superAdminOverviewService.get().then(setOverview).catch(() => {
      setError('Não foi possível carregar a administração da instalação.');
    });
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTitle>Falha ao carregar</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!overview) {
    return <div className="p-8 text-muted-foreground">Carregando administração AppEventos...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-7">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Administração AppEventos</h1>
          <Badge className="bg-violet-600">SUPERADMIN</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Empresas, consumo, conexões e capacidade da instalação em um único lugar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, key, Icon]) => (
          <Card key={key}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold">{number.format(overview.summary[key])}</p>
              </div>
              <Icon className="h-5 w-5 text-violet-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Empresas e consumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.tenants.map(tenant => (
              <div
                key={tenant.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_repeat(4,90px)] md:items-center"
              >
                <div>
                  <p className="font-semibold">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{tenant.status}</Badge>
                    <Badge variant="secondary">{tenant.subscription_status}</Badge>
                  </div>
                </div>
                {[
                  ['Usuários', tenant.usage.users],
                  ['Canais', tenant.usage.inboxes],
                  ['Conversas', tenant.usage.conversations],
                  ['Mensagens', tenant.usage.messages],
                ].map(([label, value]) => (
                  <div key={label} className="text-sm">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-semibold">{number.format(Number(value))}</p>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-violet-500" />
                Saúde dos serviços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(overview.health).map(([name, item]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{name.replace(/_/g, ' ')}</span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {item.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capacidade comercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg bg-violet-500/10 p-4">
                <p className="text-muted-foreground">Faixa inicial segura</p>
                <p className="text-2xl font-bold text-violet-500">
                  {overview.capacity.safe_commercial_range.minimum_tenants}–{overview.capacity.safe_commercial_range.maximum_tenants}
                  {' '}empresas
                </p>
              </div>
              <p>
                Servidor atual: {overview.capacity.current_server.vcpu} vCPU e{' '}
                {overview.capacity.current_server.memory_gb} GB RAM.
              </p>
              <p className="text-muted-foreground">
                Para cerca de 25 empresas: mínimo recomendado de{' '}
                {overview.capacity.recommended_for_25_tenants.vcpu} vCPU e{' '}
                {overview.capacity.recommended_for_25_tenants.memory_gb} GB RAM.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>IA gerenciada pelo superadmin</AlertTitle>
            <AlertDescription>
              Provedor, modelo e chaves ficam no servidor e nunca são enviados aos clientes.
            </AlertDescription>
            <Button className="mt-3" size="sm" onClick={() => setAiProfilesOpen(true)}>
              Gerenciar perfis privados
            </Button>
          </Alert>
        </div>
      </div>
      <ApiKeysModal open={aiProfilesOpen} onOpenChange={setAiProfilesOpen} />
    </div>
  );
};

export default AppEventosAdmin;
