import { Badge, Table, type TableColumn } from '@/components/ui';
import type { Almacen, Existencia } from '@/types/inventario';

interface Props {
  almacenes: readonly Almacen[];
  existencias: readonly Existencia[];
  isLoading: boolean;
}

export function AlmacenesTab({ almacenes, existencias, isLoading }: Props) {
  const columns: TableColumn<Almacen>[] = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Almacén' },
    { key: 'direccion', header: 'Dirección' },
    { key: 'responsable', header: 'Responsable' },
    {
      key: 'productos',
      header: 'Productos con stock',
      align: 'right',
      cell: (a) => existencias.filter((e) => e.almacenId === a.id && e.cantidad > 0).length,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (a) => (
        <Badge variant={a.estado === 'activo' ? 'success' : 'neutral'} dot>
          {a.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  return (
    <Table<Almacen>
      columns={columns}
      data={almacenes}
      rowKey={(a) => a.id}
      isLoading={isLoading}
      emptyMessage="No hay almacenes registrados."
    />
  );
}