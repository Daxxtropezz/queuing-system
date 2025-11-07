import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
      <SidebarMenu className="ml-4 overflow-x-hidden">
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} currentUrl={page.url} level={0} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavItemComponent({
  item,
  currentUrl,
  level = 0,
}: {
  item: NavItem;
  currentUrl: string;
  level?: number;
}) {
  const [open, setOpen] = useState(false);
  const isActive = item.href === currentUrl;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!hasChildren}
        isActive={isActive}
        tooltip={{ children: item.title }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <button
            type="button"
            className={clsx(
              'flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground',
              open && 'bg-accent/20'
            )}
          >
            <span className="flex items-center gap-2">
              {item.icon && <item.icon size={18} className="text-muted-foreground" />}
              {item.title}
            </span>
            {open ? (
              <ChevronDown size={16} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground" />
            )}
          </button>
        ) : (
          <Link
            href={item.href || '#'}
            prefetch={['mount', 'hover']}
            className={clsx(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground font-semibold'
            )}
          >
            {item.icon && <item.icon size={18} className="text-muted-foreground" />}
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>

      {hasChildren && open && (
        <SidebarMenu className={clsx('ml-4 border-l pl-3 mt-1 space-y-1')}>
          {item.children!.map((child) => (
            <NavItemComponent key={child.title} item={child} currentUrl={currentUrl} level={level + 1} />
          ))}
        </SidebarMenu>
      )}
    </SidebarMenuItem>
  );
}
