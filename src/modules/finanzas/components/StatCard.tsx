import { cn } from '@/utils/cn';

type Tone = 'default' | 'success' | 'danger' | 'warning';

interface Props {
  title: string;
  value: string;
  hint?: string;
  tone?: Tone;
}

const VALUE_TONE: Record<Tone, string> = {
  default: 'text-foreground',
  success: 'text-emerald-600',
  danger: 'text-destructive',
  warning: 'text-amber-600',
};

export function StatCard({ title, value, hint, tone = 'default' }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className={cn('mt-2 text-2xl font-semibold', VALUE_TONE[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}