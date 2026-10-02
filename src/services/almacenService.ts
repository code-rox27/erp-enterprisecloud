import type { Almacen } from '@/types/almacen';
import { delay } from '@/utils/delay';

const ALMACENES: Almacen[] = [
  { id: 'alm-001', codigo: 'ALM-CENTRAL', nombre: 'Almacén Central', direccion: 'Av. Argentina 1850, Callao', responsable: 'Alan Pérez', estado: 'activo' },
  { id: 'alm-002', codigo: 'ALM-NORTE', nombre: 'Almacén Norte', direccion: 'Av. Túpac Amaru 3200, Independencia', responsable: 'Rosa Medina', estado: 'activo' },
  { id: 'alm-003', codigo: 'ALM-TRANS', nombre: 'Almacén de Tránsito', direccion: 'Panamericana Sur Km 18, VES', responsable: 'Jorge Rivas', estado: 'inactivo' },
];

export const almacenService = {
  async list(): Promise<Almacen[]> {
    await delay(300);
    return structuredClone(ALMACENES);
  },
};