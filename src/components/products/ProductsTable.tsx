import { Button, Badge } from '@evoapi/design-system';
import { Pencil, Trash2, Package, TentTree } from 'lucide-react';
import type { Product } from '@/types/products';

interface Props {
  products: Product[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const CATEGORY_LABELS = {
  inflatable: 'Brinquedo inflável',
  mobile_buffet: 'Buffet móvel',
} as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function ProductsTable({
  products,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/15 py-16 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">Nenhum item cadastrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre brinquedos infláveis, barraquinhas e estruturas para locação.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map(product => {
        const image = product.images?.[0]?.url;
        const CategoryIcon = product.rental_category === 'mobile_buffet' ? TentTree : Package;
        const dimensions = String(product.metadata?.dimensions ?? '');
        return (
          <article
            key={product.id}
            className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-500/15 via-muted/40 to-fuchsia-500/10">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <CategoryIcon className="h-12 w-12 text-violet-500/60" />
              )}
              <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur">
                {CATEGORY_LABELS[product.rental_category] ?? 'Locação'}
              </Badge>
              <Badge
                variant={product.status === 'active' ? 'default' : 'secondary'}
                className="absolute right-3 top-3"
              >
                {product.status === 'active' ? 'Disponível' : product.status === 'draft' ? 'Rascunho' : 'Inativo'}
              </Badge>
            </div>

            <div className="space-y-3 p-4">
              <div>
                <h3 className="line-clamp-1 text-base font-semibold">{product.name}</h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                  {product.description || 'Sem descrição'}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Valor da locação</p>
                  <p className="text-lg font-bold text-violet-500">
                    {formatPrice(product.default_price)}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{product.stock_quantity ?? 0} unidade(s)</p>
                  {dimensions && <p>{dimensions}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-1 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canUpdate}
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canDelete}
                  onClick={() => onDelete(product)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
