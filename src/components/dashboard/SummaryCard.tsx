import type { IconType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: string; // e.g., "+5% from last month"
  trendColor?: 'text-green-600' | 'text-red-600';
  className?: string;
}

export default function SummaryCard({ title, value, icon: Icon, trend, trendColor, className }: SummaryCardProps) {
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {trend && <p className={cn("text-xs text-muted-foreground mt-1", trendColor)}>{trend}</p>}
      </CardContent>
    </Card>
  );
}
