export function normalizeBarcode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw.replace(/\D/g, '');
  const code = clean.length === 12 ? `0${clean}` : clean;
  if (![8, 13, 14].includes(code.length)) return null;
  const values = [...code].map(Number);
  const check = values.pop();
  if (check === undefined) return null;
  const sum = values.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check ? code : null;
}
