export function cleanText(value) {
  return typeof value === 'string' ? value.replace(/[<>]/g, '').trim() : value;
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isValidDate(value) {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
}
