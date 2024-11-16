"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HomeIcon, CreditCard, Settings } from "lucide-react";
import { 
  Heart,
  Wallet,
  Users,
  Brain,
  MessageSquare,
  Target,
  BarChart3,
  Compass
} from "lucide-react";

const navItems = [
  {
    title: "AI Health",
    href: "/dashboard",
    icon: Heart,
  },
  {
    title: "AI Finance",
    href: "/dashboard/billing",
    icon: Wallet,
  },
  {
    title: "Community Engagement",
    href: "/dashboard/settings",
    icon: Compass,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          asChild
        >
          <Link href={item.href} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
