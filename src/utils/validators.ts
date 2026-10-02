/** RUC peruano: 11 dígitos. */
export const isValidRuc = (value: string): boolean => /^\d{11}$/.test(value);

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value: string): boolean =>
  /^[+\d][\d\s-]{6,17}$/.test(value);