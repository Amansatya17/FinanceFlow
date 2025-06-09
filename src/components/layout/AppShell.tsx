"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Home, ShoppingCart, BarChart3, Settings, Brain, Briefcase, Menu, DollarSign as DollarSignLucide } from 'lucide-react'; // Added DollarSignLucide
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { IconType } from '@/types';

interface NavItemProps {
  href: string;
  icon: IconType;
  label: string;
  tooltip?: string;
}

const navItems: NavItemProps[] = [
  { href: '/', icon: Home, label: 'Dashboard', tooltip: 'Dashboard Overview' },
  { href: '/expenses', icon: ShoppingCart, label: 'Expenses', tooltip: 'Track Expenses' },
  { href: '/budgets', icon: Briefcase, label: 'Budgets', tooltip: 'Set Budget Goals' },
  { href: '/reports', icon: BarChart3, label: 'Reports', tooltip: 'Spending Charts' },
  { href: '/optimize', icon: Brain, label: 'Optimize', tooltip: 'Budget Optimization AI' },
];

function NavItem({ href, icon: Icon, label, tooltip }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton isActive={isActive} tooltip={tooltip || label}>
          <Icon className={isActive ? "text-sidebar-primary" : ""} />
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <DollarSignIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">FinanceFlow</h1>
          </Link>
           <div className="md:hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center w-full">
             <DollarSignIcon className="h-7 w-7 text-primary" />
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between md:justify-end">
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
          {/* Placeholder for User Profile / Settings Dropdown */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
            <span className="sr-only">User Settings</span>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


// Custom Dollar Sign Icon as lucide-react might not have a standalone one that fits the aesthetic
function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
