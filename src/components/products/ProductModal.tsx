import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evoapi/design-system';
import { ImagePlus, Package } from 'lucide-react';
import type { Product, ProductFormData, ProductStatus, RentalCategory } from '@/types/products';

interface Props {
  open: boolean;
  product?: Product | null;
  loading: boolean;
  errors?: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProductFormData, files?: File[]) => Promise<void>;
}

type FormState = {
  name: string;
  rental_category: RentalCategory;
  description: string;
  default_price: string;
  stock_quantity: string;
  status: ProductStatus;
  dimensions: string;
  voltage: string;
  requirements: string;
  notes: string;
};

const emptyForm: FormState = {
  name: '',
  rental_category: 'inflatable',
  description: '',
  default_price: '',
  stock_quantity: '1',
  status: 'active',
  dimensions: '',
  voltage: '',
  requirements: '',
  notes: '',
};

export default function ProductModal({
  open,
  product,
  loading,
  errors,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const metadata = product?.metadata ?? {};
    setForm(
      product
        ? {
            name: product.name,
            rental_category: product.rental_category ?? 'inflatable',
            description: product.description ?? '',
            default_price: String(product.default_price ?? ''),
            stock_quantity: String(product.stock_quantity ?? 1),
            status: product.status,
            dimensions: String(metadata.dimensions ?? ''),
            voltage: String(metadata.voltage ?? ''),
            requirements: String(metadata.requirements ?? ''),
            notes: String(metadata.notes ?? ''),
          }
        : emptyForm,
    );
    setFiles([]);
    setPreviews([]);
  }, [open, product]);

  useEffect(
    () => () => previews.forEach(url => URL.revokeObjectURL(url)),
    [previews],
  );

  const valid = useMemo(
    () =>
      form.name.trim().length > 0 &&
      Number(form.default_price) >= 0 &&
      Number(form.stock_quantity) >= 0,
    [form],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const addFiles = (selected: FileList | null) => {
    const next = Array.from(selected ?? []).filter(file => file.type.startsWith('image/')).slice(0, 6);
    previews.forEach(url => URL.revokeObjectURL(url));
    setFiles(next);
    setPreviews(next.map(file => URL.createObjectURL(file)));
  };

  const submit = async () => {
    if (!valid) return;
    await onSubmit(
      {
        name: form.name.trim(),
        kind: 'physical',
        rental_category: form.rental_category,
        description: form.description.trim(),
        default_price: Number(form.default_price),
        currency: 'BRL',
        status: form.status,
        stock_quantity: Number(form.stock_quantity),
        metadata: {
          dimensions: form.dimensions.trim(),
          voltage: form.voltage.trim(),
          requirements: form.requirements.trim(),
          notes: form.notes.trim(),
        },
      },
      files,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar item de locação' : 'Novo item de locação'}</DialogTitle>
          <DialogDescription>
            Cadastre brinquedos infláveis, estruturas e opções de buffet móvel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rental-product-name">Nome *</Label>
              <Input
                id="rental-product-name"
                value={form.name}
                onChange={event => update('name', event.target.value)}
                placeholder="Ex.: Tobogã Tigrão"
              />
              {errors?.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select
                value={form.rental_category}
                onValueChange={value => update('rental_category', value as RentalCategory)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflatable">Brinquedo inflável</SelectItem>
                  <SelectItem value="mobile_buffet">Buffet móvel / barraquinha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={value => update('status', value as ProductStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Disponível</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rental-product-price">Valor da locação *</Label>
              <Input
                id="rental-product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.default_price}
                onChange={event => update('default_price', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rental-product-quantity">Quantidade disponível *</Label>
              <Input
                id="rental-product-quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={event => update('stock_quantity', event.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rental-product-description">Descrição</Label>
              <Textarea
                id="rental-product-description"
                rows={3}
                value={form.description}
                onChange={event => update('description', event.target.value)}
                placeholder="Descreva o item, faixa etária e diferenciais."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rental-product-dimensions">Medidas</Label>
              <Input
                id="rental-product-dimensions"
                value={form.dimensions}
                onChange={event => update('dimensions', event.target.value)}
                placeholder="Ex.: A 4,20 x C 6,00 x L 4,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rental-product-voltage">Voltagem</Label>
              <Input
                id="rental-product-voltage"
                value={form.voltage}
                onChange={event => update('voltage', event.target.value)}
                placeholder="Ex.: 220V"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rental-product-requirements">Requisitos de instalação</Label>
              <Input
                id="rental-product-requirements"
                value={form.requirements}
                onChange={event => update('requirements', event.target.value)}
                placeholder="Espaço mínimo, acesso, tomada, cobertura..."
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rental-product-notes">Observações internas</Label>
              <Textarea
                id="rental-product-notes"
                rows={2}
                value={form.notes}
                onChange={event => update('notes', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rental-product-images">Fotos</Label>
            <label
              htmlFor="rental-product-images"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-violet-500 hover:text-violet-500"
            >
              <ImagePlus className="h-5 w-5" />
              Adicionar até 6 imagens
            </label>
            <input
              id="rental-product-images"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={event => addFiles(event.target.files)}
            />
            {(previews.length > 0 || product?.images?.length) && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(previews.length > 0 ? previews : product?.images?.map(image => image.url) ?? []).map(url => (
                  <div key={url} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={loading || !valid}>
            <Package className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : product ? 'Salvar alterações' : 'Cadastrar item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
