import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@evoapi/design-system';
import { Check, Edit3, FileDown, Loader2, MessageCircle, PackagePlus, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { BaseHeader } from '@/components/base';
import {
  businessService,
  type BusinessRecord,
  type BusinessResource,
} from '@/services/business/businessService';
import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import { useAuthStore } from '@/store/authStore';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'contact' | 'rental' | 'products';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface ColumnConfig {
  key: string;
  label: string;
  format?: 'currency' | 'date' | 'datetime' | 'status' | 'items';
}

interface Props {
  resource: BusinessResource;
  rootKey: string;
  title: string;
  subtitle: string;
  singular: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  defaults?: Record<string, unknown>;
}

interface ContactOption {
  id: string;
  name?: string;
  phone_number?: string;
}

interface RentalOption {
  id: string;
  reference_code?: string;
  title?: string;
}

interface ProductOption {
  id: string;
  name: string;
  default_price: number;
}

interface RentalItem {
  product_id?: string;
  name?: string;
  unit_price: number;
  quantity: number;
}

const statusLabels: Record<string, string> = {
  quote: 'Orçamento',
  reserved: 'Reservada',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  canceled: 'Cancelada',
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  delivered: 'Enviado',
  dismissed: 'Dispensado',
  failed: 'Falhou',
  draft: 'Rascunho',
  signed: 'Assinado',
  receivable: 'A receber',
  payable: 'A pagar',
};

const toInputValue = (value: unknown, type?: FieldConfig['type']) => {
  if (value === null || value === undefined) return '';
  if (type === 'datetime-local') return String(value).slice(0, 16);
  if (type === 'date') return String(value).slice(0, 10);
  return String(value);
};

const formatCell = (value: unknown, format?: ColumnConfig['format']) => {
  if (value === null || value === undefined || value === '') return '—';
  if (format === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  }
  if (format === 'date' || format === 'datetime') {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat('pt-BR', format === 'datetime'
        ? { dateStyle: 'short', timeStyle: 'short' }
        : { dateStyle: 'short' }).format(date);
  }
  if (format === 'status') return statusLabels[String(value)] || String(value);
  if (format === 'items') {
    const items = Array.isArray(value) ? value as RentalItem[] : [];
    if (items.length === 0) return '—';
    return items.map(item => `${item.quantity || 1}× ${item.name || 'Produto'}`).join(', ');
  }
  return String(value);
};

const nestedValue = (record: BusinessRecord, path: string): unknown =>
  path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, record);

export default function BusinessCrudPage({
  resource,
  rootKey,
  title,
  subtitle,
  singular,
  fields,
  columns,
  defaults = {},
}: Props) {
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [rentals, setRentals] = useState<RentalOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [signatureTarget, setSignatureTarget] = useState<BusinessRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await businessService.list(resource));
    } catch {
      toast.error(`Não foi possível carregar ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [resource, title]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!fields.some(field => field.type === 'contact')) return;
    api.get('/contacts', { params: { page: 1, per_page: 500 } })
      .then(response => {
        const payload = extractData<ContactOption[] | { data?: ContactOption[] }>(response);
        setContacts(Array.isArray(payload) ? payload : payload.data || []);
      })
      .catch(() => setContacts([]));
  }, [fields]);

  useEffect(() => {
    if (!fields.some(field => field.type === 'rental')) return;
    businessService.list('rentals')
      .then(data => setRentals(data.map(record => ({
        id: record.id,
        reference_code: String(record.reference_code || ''),
        title: String(record.title || ''),
      }))))
      .catch(() => setRentals([]));
  }, [fields]);

  useEffect(() => {
    if (!fields.some(field => field.type === 'products')) return;
    api.get('/products', { params: { page: 1, per_page: 500, status: 'active' } })
      .then(response => {
        const payload = extractData<ProductOption[] | { data?: ProductOption[] }>(response);
        setProducts(Array.isArray(payload) ? payload : payload.data || []);
      })
      .catch(() => setProducts([]));
  }, [fields]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaults);
    setDialogOpen(true);
  };

  const openEdit = (record: BusinessRecord) => {
    setEditing(record);
    setForm(record);
    setDialogOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await businessService.update(resource, rootKey, editing.id, form);
      } else {
        await businessService.create(resource, rootKey, form);
      }
      toast.success(`${singular} ${editing ? 'atualizado' : 'criado'} com sucesso.`);
      setDialogOpen(false);
      await load();
    } catch {
      toast.error(`Não foi possível salvar ${singular.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: BusinessRecord) => {
    if (!window.confirm(`Excluir ${singular.toLowerCase()}?`)) return;
    try {
      await businessService.remove(resource, record.id);
      toast.success(`${singular} excluído.`);
      await load();
    } catch {
      toast.error(`Não foi possível excluir ${singular.toLowerCase()}.`);
    }
  };

  const runAction = async (record: BusinessRecord, action: string) => {
    try {
      await businessService.action(resource, record.id, action);
      toast.success('Ação realizada com sucesso.');
      await load();
    } catch {
      toast.error('Não foi possível realizar a ação.');
    }
  };

  const empty = useMemo(() => !loading && records.length === 0, [loading, records.length]);

  return (
    <div className="h-full overflow-auto p-4 space-y-5">
      <BaseHeader
        title={title}
        subtitle={subtitle}
        totalCount={records.length}
        primaryAction={{ label: `Novo ${singular}`, icon: <Plus className="h-4 w-4" />, onClick: openCreate }}
      />

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...
        </div>
      )}

      {empty && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="font-medium">Nenhum registro encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie o primeiro registro para começar.</p>
            <Button className="mt-5" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Novo {singular}</Button>
          </CardContent>
        </Card>
      )}

      {!loading && records.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="grid min-w-[850px] grid-cols-[repeat(var(--cols),minmax(140px,1fr))_180px] border-b bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground" style={{ '--cols': columns.length } as React.CSSProperties}>
            {columns.map(column => <span key={column.key}>{column.label}</span>)}
            <span className="text-right">Ações</span>
          </div>
          {records.map(record => (
            <div key={record.id} className="grid min-w-[850px] grid-cols-[repeat(var(--cols),minmax(140px,1fr))_180px] items-center border-b px-4 py-3 text-sm last:border-b-0 hover:bg-muted/30" style={{ '--cols': columns.length } as React.CSSProperties}>
              {columns.map(column => (
                <span key={column.key} className="truncate pr-3">
                  {column.format === 'status'
                    ? <Badge variant="secondary">{formatCell(nestedValue(record, column.key), column.format)}</Badge>
                    : formatCell(nestedValue(record, column.key), column.format)}
                </span>
              ))}
              <div className="flex justify-end gap-1">
                {resource === 'financial_entries' && record.status !== 'paid' && (
                  <Button size="icon" variant="ghost" title="Marcar como pago" onClick={() => runAction(record, 'mark_paid')}><Check className="h-4 w-4" /></Button>
                )}
                {resource === 'business_reminders' && record.status === 'pending' && (
                  <Button size="icon" variant="ghost" title="Enviar agora" onClick={() => runAction(record, 'deliver')}><MessageCircle className="h-4 w-4" /></Button>
                )}
                {resource === 'contracts' && record.status !== 'signed' && (
                  <Button size="icon" variant="ghost" title="Assinar" onClick={() => setSignatureTarget(record)}><Edit3 className="h-4 w-4" /></Button>
                )}
                {resource === 'contracts' && (
                  <Button size="icon" variant="ghost" title="Abrir PDF" onClick={() => {
                    const token = useAuthStore.getState().accessToken;
                    fetch(businessService.contractPdfUrl(record.id), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                      .then(response => response.blob())
                      .then(blob => window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer'));
                  }}><FileDown className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(record)}><Edit3 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" title="Excluir" onClick={() => remove(record)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} {singular}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                  <Label htmlFor={`${resource}-${field.key}`}>{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea id={`${resource}-${field.key}`} rows={5} required={field.required} value={toInputValue(form[field.key], field.type)} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))} />
                  ) : field.type === 'products' ? (
                    <RentalItemsEditor
                      items={((form.metadata as Record<string, unknown> | undefined)?.items as RentalItem[] | undefined) || []}
                      products={products}
                      onChange={items => {
                        const total = items.reduce(
                          (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
                          0,
                        );
                        setForm(current => ({
                          ...current,
                          total_amount: total,
                          metadata: {
                            ...((current.metadata as Record<string, unknown> | undefined) || {}),
                            items,
                          },
                        }));
                      }}
                    />
                  ) : field.type === 'select' || field.type === 'contact' || field.type === 'rental' ? (
                    <Select value={toInputValue(form[field.key]) || '__none__'} onValueChange={value => setForm(current => ({ ...current, [field.key]: value === '__none__' ? null : value }))}>
                      <SelectTrigger id={`${resource}-${field.key}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum</SelectItem>
                        {(field.type === 'contact'
                          ? contacts.map(contact => ({ value: contact.id, label: contact.name || contact.phone_number || 'Contato' }))
                          : field.type === 'rental'
                            ? rentals.map(rental => ({ value: rental.id, label: `${rental.reference_code} · ${rental.title}` }))
                            : field.options || []).map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id={`${resource}-${field.key}`} type={field.type || 'text'} step={field.type === 'number' ? '0.01' : undefined} required={field.required} value={toInputValue(form[field.key], field.type)} onChange={event => setForm(current => ({ ...current, [field.key]: field.type === 'number' ? Number(event.target.value) : event.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SignatureDialog target={signatureTarget} onClose={() => setSignatureTarget(null)} onSigned={load} />
    </div>
  );
}

function RentalItemsEditor({
  items,
  products,
  onChange,
}: {
  items: RentalItem[];
  products: ProductOption[];
  onChange: (items: RentalItem[]) => void;
}) {
  const addProduct = (productId: string) => {
    const product = products.find(candidate => candidate.id === productId);
    if (!product) return;
    const existingIndex = items.findIndex(item => item.product_id === productId);
    if (existingIndex >= 0) {
      onChange(items.map((item, index) => index === existingIndex
        ? { ...item, quantity: Number(item.quantity || 0) + 1 }
        : item));
      return;
    }
    onChange([...items, {
      product_id: product.id,
      name: product.name,
      unit_price: Number(product.default_price || 0),
      quantity: 1,
    }]);
  };

  const updateItem = (index: number, patch: Partial<RentalItem>) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <Select value="" onValueChange={addProduct}>
        <SelectTrigger>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PackagePlus className="h-4 w-4" />
            <SelectValue placeholder="Adicionar produto do catálogo" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {products.map(product => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} · {formatCell(product.default_price, 'currency')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {items.length === 0 && (
        <p className="py-2 text-center text-sm text-muted-foreground">Nenhum item adicionado.</p>
      )}

      {items.map((item, index) => (
        <div key={`${item.product_id || item.name}-${index}`} className="grid grid-cols-[1fr_86px_120px_36px] items-end gap-2 rounded-lg bg-background p-2">
          <div>
            <Label className="text-xs">Produto</Label>
            <p className="mt-2 truncate text-sm font-medium">{item.name || 'Produto'}</p>
          </div>
          <div>
            <Label className="text-xs">Qtd.</Label>
            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={event => updateItem(index, { quantity: Math.max(1, Number(event.target.value)) })}
            />
          </div>
          <div>
            <Label className="text-xs">Valor unitário</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={item.unit_price}
              onChange={event => updateItem(index, { unit_price: Math.max(0, Number(event.target.value)) })}
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Remover item"
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function SignatureDialog({ target, onClose, onSigned }: { target: BusinessRecord | null; onClose: () => void; onSigned: () => Promise<void> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signer, setSigner] = useState('');

  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const point = position(event);
    const context = event.currentTarget.getContext('2d');
    context?.beginPath();
    context?.moveTo(point.x, point.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const point = position(event);
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    context.lineWidth = 2.2;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const sign = async () => {
    if (!target || !canvasRef.current || !signer.trim()) {
      toast.error('Informe o responsável e desenhe a assinatura.');
      return;
    }
    await businessService.action('contracts', target.id, 'sign', {
      contract: {
        company_signer_name: signer,
        company_signature_data: canvasRef.current.toDataURL('image/png'),
      },
    });
    toast.success('Contrato assinado e selado.');
    onClose();
    await onSigned();
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assinatura da empresa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="company-signer">Responsável pela empresa</Label>
            <Input id="company-signer" value={signer} onChange={event => setSigner(event.target.value)} />
          </div>
          <canvas ref={canvasRef} width={520} height={180} className="h-44 w-full touch-none rounded-lg border bg-white" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} />
          <Button type="button" variant="ghost" size="sm" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 520, 180)}>Limpar assinatura</Button>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={sign}>Assinar contrato</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
