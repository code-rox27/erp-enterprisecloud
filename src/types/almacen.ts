export interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  responsable: string;
  estado: 'activo' | 'inactivo';
}