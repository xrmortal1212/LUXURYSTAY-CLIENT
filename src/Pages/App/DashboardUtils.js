export const money = value => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

export const dateLabel = value => value
  ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

export const dateTimeLabel = value => value
  ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  : '—';

export const titleCase = value => String(value || 'unknown').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export const localDayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setMilliseconds(-1);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};