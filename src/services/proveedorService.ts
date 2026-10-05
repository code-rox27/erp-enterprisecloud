import type { ContactoInput, Proveedor, ProveedorInput } from '@/types/proveedor';
import { delay, generateId } from '@/utils/delay';
import { db } from './mockDb';

const findIndexOrThrow = (id: string): number => {
  const index = db.proveedores.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Proveedor no encontrado');
  return index;
};

const assertRucUnique = (ruc: string, ignoreId?: string): void => {
  if (db.proveedores.some((p) => p.ruc === ruc && p.id !== ignoreId)) {
    throw new Error('Ya existe un proveedor registrado con ese RUC');
  }
};

export const proveedorService = {
  async list(): Promise<Proveedor[]> {
    await delay();
    return structuredClone(db.proveedores);
  },

  async create(input: ProveedorInput): Promise<Proveedor> {
    await delay();
    assertRucUnique(input.ruc);
    const nuevo: Proveedor = {
      ...input,
      id: generateId('prv'),
      estado: 'activo',
      contactos: [],
      creadoEn: new Date().toISOString(),
      lineaCredito: 0,
      plazoPagoDias: 0,
    };
    db.proveedores.unshift(nuevo);
    return structuredClone(nuevo);
  },

  async update(id: string, input: ProveedorInput): Promise<Proveedor> {
    await delay();
    const index = findIndexOrThrow(id);
    assertRucUnique(input.ruc, id);
    const actualizado: Proveedor = { ...db.proveedores[index]!, ...input };
    db.proveedores[index] = actualizado;
    return structuredClone(actualizado);
  },

  async setEstado(id: string, estado: Proveedor['estado']): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actualizado: Proveedor = { ...db.proveedores[index]!, estado };
    db.proveedores[index] = actualizado;
    return structuredClone(actualizado);
  },

  async addContacto(id: string, input: ContactoInput): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actual = db.proveedores[index]!;
    const contacto = {
      ...input,
      id: generateId('c'),
      principal: actual.contactos.length === 0,
    };
    const actualizado: Proveedor = { ...actual, contactos: [...actual.contactos, contacto] };
    db.proveedores[index] = actualizado;
    return structuredClone(actualizado);
  },

  async removeContacto(id: string, contactoId: string): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actual = db.proveedores[index]!;
    const restantes = actual.contactos.filter((c) => c.id !== contactoId);
    const contactos = restantes.some((c) => c.principal)
      ? restantes
      : restantes.map((c, i) => ({ ...c, principal: i === 0 }));
    const actualizado: Proveedor = { ...actual, contactos };
    db.proveedores[index] = actualizado;
    return structuredClone(actualizado);
  },
};