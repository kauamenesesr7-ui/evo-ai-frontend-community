import type { LucideIcon } from 'lucide-react';
import {
  User,
  LogOut,
  Cog,
  MessageSquare,
  Contact,
  SquareKanban,
  Bot,
  Layers,
  PieChart,
  Users2,
  Clock,
  Code,
  MessageCircle,
  LayoutTemplate,
  Tags,
  Workflow,
  Settings,
  List,
  Shield,
  Package,
  Filter,
  Megaphone,
  Route,
  ShieldCheck,
  CalendarDays,
  WalletCards,
  BellRing,
  FileSignature,
  CreditCard,
} from 'lucide-react';

export interface MenuItem {
  id?: string;
  name: string;
  href: string;
  icon: LucideIcon;
  subItems?: SubMenuItem[];
  resource?: string;
  action?: string;
  permissions?: string[];
  requireAll?: boolean;
  requiredRoleKey?: string;
  badge?: number;
}

export interface SubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  resource?: string;
  action?: string;
  permissions?: string[];
  requireAll?: boolean;
  requiredRoleKey?: string;
}

export interface ProfileMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const getCustomerMenuItems = (_t: (key: string) => string): MenuItem[] => [
  { name: 'Início', href: '/dashboard', icon: PieChart },
  {
    name: 'Conversas',
    href: '/conversations',
    icon: MessageSquare,
    resource: 'conversations',
    action: 'read',
  },
  {
    name: 'Pipelines',
    href: '/pipelines',
    icon: SquareKanban,
    resource: 'pipelines',
    action: 'read',
  },
  { name: 'Contratos', href: '/contracts', icon: FileSignature },
  { name: 'Locações', href: '/rentals', icon: CalendarDays },
  {
    name: 'Produtos',
    href: '/products',
    icon: Package,
    resource: 'products',
    action: 'read',
  },
  { name: 'Financeiro', href: '/finance', icon: WalletCards },
  { name: 'Lembretes', href: '/reminders', icon: BellRing },
  {
    id: 'customer-contacts',
    name: 'Contatos',
    href: '/contacts',
    icon: Contact,
    resource: 'contacts',
    action: 'read',
    subItems: [
      { name: 'Lista de contatos', href: '/contacts', icon: Contact, resource: 'contacts', action: 'read' },
      {
        name: 'Ações agendadas',
        href: '/contacts/scheduled-actions',
        icon: Clock,
        resource: 'contacts',
        action: 'read',
      },
    ],
  },
  {
    name: 'Respostas rápidas',
    href: '/quick-replies',
    icon: MessageCircle,
    resource: 'canned_responses',
    action: 'read',
  },
  {
    name: 'Campanhas',
    href: '/campaigns',
    icon: Megaphone,
    resource: 'campaigns',
    action: 'read',
  },
  {
    name: 'Automações',
    href: '/automation',
    icon: Workflow,
    resource: 'automation_rules',
    action: 'read',
  },
  {
    name: 'Jornadas',
    href: '/journeys',
    icon: Route,
    resource: 'journeys',
    action: 'read',
  },
  {
    id: 'customer-agents',
    name: 'Agentes IA',
    href: '/agents/list',
    icon: Bot,
    resource: 'ai_agents',
    action: 'read',
    subItems: [
      { name: 'Meus agentes', href: '/agents/list', icon: List, resource: 'ai_agents', action: 'read' },
    ],
  },
  {
    name: 'Canais',
    href: '/channels',
    icon: Layers,
    resource: 'inboxes',
    action: 'read',
  },
  {
    name: 'Administração SaaS',
    href: '/admin',
    icon: Shield,
    requiredRoleKey: 'super_admin',
  },
  { name: 'Assinatura', href: '/subscription', icon: CreditCard },
  {
    id: 'customer-settings',
    name: 'Configurações',
    href: '#',
    icon: Cog,
    subItems: [
      { name: 'Conta', href: '/settings/account', icon: User, resource: 'accounts', action: 'read' },
      { name: 'Usuários', href: '/settings/users', icon: Users2, resource: 'users', action: 'manage' },
      { name: 'Equipes', href: '/settings/teams', icon: Clock, resource: 'teams', action: 'read' },
      { name: 'Etiquetas', href: '/settings/labels', icon: Tags, resource: 'labels', action: 'read' },
      {
        name: 'Atributos',
        href: '/settings/attributes',
        icon: Code,
        resource: 'custom_attribute_definitions',
        action: 'read',
      },
      { name: 'Segmentos', href: '/settings/segments', icon: Filter, resource: 'segments', action: 'read' },
      {
        name: 'Modelos de mensagem',
        href: '/settings/message-templates',
        icon: LayoutTemplate,
        resource: 'message_templates',
        action: 'read',
      },
      { name: 'Macros', href: '/settings/macros', icon: Settings, resource: 'macros', action: 'read' },
      {
        name: 'Integrações autorizadas',
        href: '/settings/integrations',
        icon: Settings,
        resource: 'integrations',
        action: 'read',
      },
      { name: 'Papéis e permissões', href: '/settings/roles', icon: ShieldCheck, resource: 'roles', action: 'read' },
    ],
  },
];

export const getProfileMenuItems = (
  _t: (key: string) => string,
  navigate: (path: string) => void,
  setLogoutDialogOpen: (open: boolean) => void,
): ProfileMenuItem[] => [
  {
    name: 'Meu perfil',
    href: '/profile',
    icon: User,
    onClick: () => navigate('/profile'),
  },
  {
    name: 'Sair',
    href: '#',
    icon: LogOut,
    onClick: () => setLogoutDialogOpen(true),
  },
];

export const shouldShowMenuItem = (
  item: MenuItem | SubMenuItem,
  canFunction: (resource: string, action: string) => boolean,
  canAnyFunction: (permissions: string[]) => boolean,
  canAllFunction: (permissions: string[]) => boolean,
  userRoleKey?: string,
): boolean => {
  if (item.requiredRoleKey) {
    return userRoleKey === item.requiredRoleKey;
  }

  if (item.permissions?.length) {
    return item.requireAll
      ? canAllFunction(item.permissions)
      : canAnyFunction(item.permissions);
  }

  if (item.resource && item.action) {
    return canFunction(item.resource, item.action);
  }

  return true;
};

export const filterMenuItemsByPermissions = (
  items: MenuItem[],
  canFunction: (resource: string, action: string) => boolean,
  canAnyFunction: (permissions: string[]) => boolean,
  canAllFunction: (permissions: string[]) => boolean,
  userRoleKey?: string,
): MenuItem[] =>
  items
    .filter(item =>
      shouldShowMenuItem(item, canFunction, canAnyFunction, canAllFunction, userRoleKey),
    )
    .map(item => {
      if (!item.subItems?.length) return item;

      const subItems = item.subItems.filter(subItem =>
        shouldShowMenuItem(
          subItem,
          canFunction,
          canAnyFunction,
          canAllFunction,
          userRoleKey,
        ),
      );

      return subItems.length ? { ...item, subItems } : null;
    })
    .filter((item): item is MenuItem => item !== null);
