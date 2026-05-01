export function firstName(name?: string): string {
  if (!name) return "";
  return name.trim().split(/\s+/)[0] ?? "";
}

// Aceita formatos com ou sem máscara, valida tamanho mínimo
export function normalizePhone(value: string): string {
  return value.replace(/\D+/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 14;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 80;
}

export function maskPhoneBR(value: string): string {
  const d = normalizePhone(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
