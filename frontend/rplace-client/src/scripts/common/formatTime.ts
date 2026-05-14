export function formatTime(ms: number): string {
    const seconds = ms;
    if (seconds >= 86_400) return (seconds / 86_400).toFixed(0).replace(/\.0$/, '') + 'j';
    if (seconds >= 3_600)  return (seconds / 3_600).toFixed(0).replace(/\.0$/, '') + 'h';
    if (seconds >= 60)     return (seconds / 60).toFixed(0).replace(/\.0$/, '') + 'min';
    return seconds.toFixed(0) + 's';
}
