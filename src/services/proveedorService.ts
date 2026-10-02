import type {
  ContactoInput,
  Proveedor,
  ProveedorInput,
} from '@/types/proveedor';
import { delay, generateId } from '@/utils/delay';

const SEED: Proveedor[] = [
  {
    id: 'prv-001',
    ruc: '20100070970',
    razonSocial: 'Distribuidora Andina S.A.C.',
    categoria: 'Materia prima',
    email: 'ventas@andina.pe',
    telefono: '014567890',
    direccion: 'Av. Argentina 1850, Callao',
    estado: 'activo',
    creadoEn: '2026-03-12T10:00:00.000Z',
    contactos: [
      { id: 'c-001', nombre: 'Luis Quispe', cargo: 'Ejecutivo de cuentas', email: 'lquispe@andina.pe', telefono: '987654321', principal: true },
    ],
  },
  {
    id: 'prv-002',
    ruc: '20512345678',
    razonSocial: 'Insumos Industriales del Perú S.R.L.',
    categoria: 'Insumos',
    email: 'contacto@insumosperu.com',
    telefono: '012345678',
    direccion: 'Jr. Los Artesanos 450, Ate',
    estado: 'activo',
    creadoEn: '2026-04-02T15:30:00.000Z',
    contactos: [
      { id: 'c-002', nombre: 'María Torres', cargo: 'Gerente comercial', email: 'mtorres@insumosperu.com', telefono: '999111222', principal: true },
      { id: 'c-003', nombre: 'Jorge Rivas', cargo: 'Soporte', email: 'jrivas@insumosperu.com', telefono: '999333444', principal: false },
    ],
  },
  {
    id: 'prv-003',
    ruc: '20601234567',
    razonSocial: 'TecnoSoluciones Lima E.I.R.L.',
    categoria: 'Tecnología',
    email: 'info@tecnolima.pe',
    telefono: '016543210',
    direccion: 'Av. Javier Prado Este 2310, San Borja',
    estado: 'activo',
    creadoEn: '2026-05-20T09:15:00.000Z',
    contactos: [],
  },
  {
    id: 'prv-004',
    ruc: '20456789012',
    razonSocial: 'Transportes Rápidos del Sur S.A.',
    categoria: 'Logística',
    email: 'operaciones@trsur.pe',
    telefono: '014440000',
    direccion: 'Panamericana Sur Km 18, Villa El Salvador',
    estado: 'inactivo',
    creadoEn: '2026-01-08T08:00:00.000Z',
    contactos: [
      { id: 'c-004', nombre: 'Rosa Medina', cargo: 'Jefa de operaciones', email: 'rmedina@trsur.pe', telefono: '988777666', principal: true },
    ],
  },
];

// "Base de datos" en memoria: se reinicia al recargar la página.
let db: Proveedor[] = structuredClone(SEED);

const findIndexOrThrow = (id: string): number => {
  const index = db.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Proveedor no encontrado');
  return index;
};

const assertRucUnique = (ruc: string, ignoreId?: string): void => {
  if (db.some((p) => p.ruc === ruc && p.id !== ignoreId)) {
    throw new Error('Ya existe un proveedor registrado con ese RUC');
  }
};

export const proveedorService = {
  async list(): Promise<Proveedor[]> {
    await delay();
    return structuredClone(db);
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
    };
    db = [nuevo, ...db];
    return structuredClone(nuevo);
  },

  async update(id: string, input: ProveedorInput): Promise<Proveedor> {
    await delay();
    const index = findIndexOrThrow(id);
    assertRucUnique(input.ruc, id);
    const actualizado: Proveedor = { ...db[index]!, ...input };
    db[index] = actualizado;
    return structuredClone(actualizado);
  },

  async setEstado(id: string, estado: Proveedor['estado']): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actualizado: Proveedor = { ...db[index]!, estado };
    db[index] = actualizado;
    return structuredClone(actualizado);
  },

  async addContacto(id: string, input: ContactoInput): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actual = db[index]!;
    const contacto = {
      ...input,
      id: generateId('c'),
      principal: actual.contactos.length === 0, // el primero queda como principal
    };
    const actualizado: Proveedor = { ...actual, contactos: [...actual.contactos, contacto] };
    db[index] = actualizado;
    return structuredClone(actualizado);
  },

  async removeContacto(id: string, contactoId: string): Promise<Proveedor> {
    await delay(300);
    const index = findIndexOrThrow(id);
    const actual = db[index]!;
    const restantes = actual.contactos.filter((c) => c.id !== contactoId);
    // si se borró el principal, el primero restante pasa a serlo
    const contactos = restantes.some((c) => c.principal)
      ? restantes
      : restantes.map((c, i) => ({ ...c, principal: i === 0 }));
    const actualizado: Proveedor = { ...actual, contactos };
    db[index] = actualizado;
    return structuredClone(actualizado);
  },
};