export function formatNumber(n: number): string {
    if (n >= 1000) {
        if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 't';
        if (n >= 1_000_000_000)     return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
        if (n >= 1_000_000)         return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
        return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    
    return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}
