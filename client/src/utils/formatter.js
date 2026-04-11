export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map(v => v < 10 ? '0' + v : v)
    .filter((v, i) => v !== '00' || i > 0) // Don't show leading '00' for hours/minutes if zero
    .join(':');
};

export const formatPercentage = (value, decimals = 0) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatTemperature = (value, unit = 'C') => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}°${unit}`;
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

