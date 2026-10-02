import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TableColumn<T> {
  /** Identificador único de la columna. */
  key: string;
  header: ReactNode;
  /** Cómo renderizar la celda. Si se omite, se lee row[key]. */
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: readonly TableColumn<T>[];
  data: readonly T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** Cantidad de filas esqueleto mientras carga. */
  skeletonRows?: number;
  className?: string;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = 'No hay registros para mostrar.',
  onRowClick,
  skeletonRows = 5,
  className,
}: TableProps<T>) {
  const renderCell = (row: T, col: TableColumn<T>): ReactNode => {
    if (col.cell) return col.cell(row);
    const value = (row as Record<string, unknown>)[col.key];
    return value === null || value === undefined ? '—' : String(value);
  };

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-card', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                  ALIGN[col.align ?? 'left'],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading &&
            Array.from({ length: skeletonRows }, (_, i) => (
              <tr key={`sk-${i}`} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-background" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-border text-foreground last:border-0',
                  onRowClick && 'cursor-pointer transition hover:bg-background',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3', ALIGN[col.align ?? 'left'], col.className)}
                  >
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}