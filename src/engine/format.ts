const group = (n: number) => n.toLocaleString('en-US');
export const fmtSize = (km: number) => {
  if (km >= 1e9) return `${+(km / 1e9).toFixed(km >= 1e11 ? 0 : 2)} billion km`;
  if (km >= 1e6) return `${+(km / 1e6).toFixed(1)} million km`;
  return `${group(Math.round(km))} km`;
};
export const fmtRatio = (r: number) => (r < 1.1 ? r.toFixed(2) : r < 10 ? r.toFixed(1) : group(Math.round(r)));
