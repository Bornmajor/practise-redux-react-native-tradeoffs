// "15.49" style price
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

// "1 Nov 2026" style date. timeZone 'UTC' because the API stores dates at UTC midnight;
// without it, users in some time zones would see the previous day.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ISO date/time → "YYYY-MM-DD" for the form's date field
export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}
