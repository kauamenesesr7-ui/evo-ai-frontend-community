import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardContent, Dialog, DialogContent, DialogHeader,
  DialogTitle, Input, Label, Textarea,
} from '@evoapi/design-system';
import { ArrowLeft, Eye, FilePlus2, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BaseHeader } from '@/components/base';
import { businessService, type BusinessRecord } from '@/services/business/businessService';

const VARIABLES = [
  ['{{nome_cliente}}', 'Nome do cliente'], ['{{cpf_cliente}}', 'CPF do cliente'],
  ['{{telefone_cliente}}', 'Telefone do cliente'], ['{{email_cliente}}', 'E-mail do cliente'],
  ['{{endereco_evento}}', 'Endereço do evento'], ['{{data_evento}}', 'Data do evento'],
  ['{{data_retirada}}', 'Data de retirada'], ['{{horario_entrega}}', 'Horário de entrega'],
  ['{{horario_retirada}}', 'Horário de retirada'], ['{{itens_locacao}}', 'Lista de itens da locação'],
  ['{{valor_total}}', 'Valor total'], ['{{valor_desconto}}', 'Valor do desconto'],
  ['{{valor_frete}}', 'Valor do frete/deslocamento'], ['{{valor_pago}}', 'Valor pago (sinal)'],
  ['{{valor_restante}}', 'Valor restante a pagar'], ['{{status_pagamento}}', 'Status do pagamento'],
  ['{{data_pagamento_sinal}}', 'Data de pagamento do sinal'],
  ['{{data_pagamento_total}}', 'Data de pagamento total'],
  ['{{nome_empresa}}', 'Nome da empresa'], ['{{telefone_empresa}}', 'Telefone da empresa'],
  ['{{cnpj_empresa}}', 'CNPJ/CPF da empresa'], ['{{data_atual}}', 'Data atual'],
] as const;

const EMPTY_TEMPLATE = { name: '', content: '', is_default: true };

export default function ContractTemplatesManager() {
  const [templates, setTemplates] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<BusinessRecord | null | undefined>(undefined);
  const [form, setForm] = useState<Record<string, unknown>>(EMPTY_TEMPLATE);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTemplates(await businessService.list('contract_templates'));
    } catch {
      toast.error('Não foi possível carregar os modelos de contrato.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const latestTemplates = useMemo(() => {
    const byName = new Map<string, BusinessRecord>();
    templates.forEach(template => {
      const name = String(template.name || '');
      const current = byName.get(name);
      if (!current || Number(template.version || 0) > Number(current.version || 0)) byName.set(name, template);
    });
    return Array.from(byName.values());
  }, [templates]);

  const startCreate = () => {
    setEditing(null);
    setForm(EMPTY_TEMPLATE);
  };

  const startEdit = (template: BusinessRecord) => {
    setEditing(template);
    setForm({
      name: template.name || '',
      content: template.content || '',
      is_default: Boolean(template.is_default),
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await businessService.update('contract_templates', 'contract_template', editing.id, form);
      } else {
        await businessService.create('contract_templates', 'contract_template', form);
      }
      toast.success(editing ? 'Nova versão do modelo criada.' : 'Modelo criado com sucesso.');
      setEditing(undefined);
      await load();
    } catch {
      toast.error('Não foi possível salvar o modelo.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (template: BusinessRecord) => {
    if (!window.confirm(`Excluir o modelo "${template.name}"?`)) return;
    try {
      await businessService.remove('contract_templates', template.id);
      toast.success('Modelo excluído.');
      await load();
    } catch {
      toast.error('Não foi possível excluir o modelo.');
    }
  };

  if (editing !== undefined) {
    return (
      <div className="h-full overflow-auto p-4">
        <button type="button" className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => setEditing(undefined)}>
          <ArrowLeft className="h-4 w-4" /> Voltar para modelos
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{editing ? 'Editar Modelo de Contrato' : 'Novo Modelo de Contrato'}</h1>
          <p className="text-sm text-muted-foreground">Use variáveis que serão substituídas automaticamente pelos dados da locação.</p>
        </div>

        <form onSubmit={save} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="contract-template-name">Nome do modelo</Label>
                <Input id="contract-template-name" placeholder="Ex: Contrato Padrão de Locação" required value={String(form.name || '')} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract-template-content">Conteúdo do contrato (HTML)</Label>
                <Textarea id="contract-template-content" className="min-h-[520px] font-mono text-xs leading-relaxed" placeholder="Digite o conteúdo HTML do contrato..." required value={String(form.content || '')} onChange={event => setForm(current => ({ ...current, content: event.target.value }))} />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={Boolean(form.is_default)} onChange={event => setForm(current => ({ ...current, is_default: event.target.checked }))} />
                <span className="text-sm font-medium">Definir como modelo padrão</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Salvar Alterações' : 'Criar Modelo'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="mr-2 h-4 w-4" /> Preview</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit xl:sticky xl:top-4">
            <CardContent className="p-5">
              <h3 className="font-semibold">Variáveis Disponíveis</h3>
              <p className="mt-1 text-xs text-muted-foreground">Clique em uma variável para copiá-la e cole no conteúdo.</p>
              <div className="mt-4 max-h-[650px] space-y-2 overflow-auto pr-1">
                {VARIABLES.map(([variable, label]) => (
                  <button key={variable} type="button" className="w-full rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/50" onClick={() => {
                    navigator.clipboard.writeText(variable);
                    toast.success(`${variable} copiada.`);
                  }}>
                    <code className="text-xs font-semibold text-primary">{variable}</code>
                    <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden">
            <DialogHeader><DialogTitle>Preview do contrato</DialogTitle></DialogHeader>
            <iframe title="Preview do contrato" sandbox="" srcDoc={String(form.content || '')} className="h-[75vh] w-full rounded-lg border bg-white" />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <BaseHeader title="Modelos de Contrato" subtitle="Gerencie os modelos de contrato da sua empresa." totalCount={latestTemplates.length} primaryAction={{ label: 'Novo Modelo', icon: <FilePlus2 className="h-4 w-4" />, onClick: startCreate }} />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {latestTemplates.map(template => (
            <Card key={template.id} className="transition-colors hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{String(template.name)}</h3>
                      {Boolean(template.is_default) && <Badge>Padrão</Badge>}
                      <Badge variant="secondary">Versão {String(template.version || 1)}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(String(template.created_at)))}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" title="Editar" onClick={() => startEdit(template)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Excluir" onClick={() => remove(template)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
