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

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>{"Main Menu"}</SidebarGroupLabel>
      <SidebarMenu className="ml-4 overflow-x-hidden">
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} currentUrl={page.url} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavItemComponent({
  item,
  currentUrl,
}: {
  item: NavItem;
  currentUrl: string;
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
          <button type="button" className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              {item.icon && <item.icon size={18} className="text-muted-foreground" />}
              {item.title}
            </span>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <Link href={item.href || '#'} prefetch={['mount', 'hover']} className="flex items-center">
            {item.icon && <item.icon size={18} className="mr-2 text-muted-foreground" />}
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>

      {hasChildren && open && (
        <SidebarMenu className="ml-4">
          {item.children!.map((child) => (
            <NavItemComponent key={child.title} item={child} currentUrl={currentUrl} />
          ))}
        </SidebarMenu>
      )}
    </SidebarMenuItem>
  );
}

