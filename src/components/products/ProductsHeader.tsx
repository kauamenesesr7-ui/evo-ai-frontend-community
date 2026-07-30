import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evoapi/design-system';
import { PlusIcon, Search } from 'lucide-react';
import type { ProductStatus, RentalCategory } from '@/types/products';

interface Props {
  search: string;
  categoryFilter: RentalCategory | 'all';
  statusFilter: ProductStatus | 'all';
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: RentalCategory | 'all') => void;
  onStatusChange: (value: ProductStatus | 'all') => void;
  onCreate: () => void;
}

export default function ProductsHeader({
  search,
  categoryFilter,
  statusFilter,
  canCreate,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onCreate,
}: Props) {
  const { t } = useLanguage('products');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('header.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as RentalCategory | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="inflatable">Brinquedos infláveis</SelectItem>
            <SelectItem value="mobile_buffet">Buffet móvel e barraquinhas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as ProductStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('header.filters.statusAll')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
            <SelectItem value="draft">{t('status.draft')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreate} disabled={!canCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('header.new')}
        </Button>
      </div>
    </div>
  );
}
