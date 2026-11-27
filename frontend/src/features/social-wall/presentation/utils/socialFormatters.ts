export function getRelativeTime(date: string): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  );

  if (elapsedMinutes < 1) return 'ahora mismo';
  if (elapsedMinutes < 60) {
    return `hace ${elapsedMinutes} ${elapsedMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `hace ${elapsedHours} ${elapsedHours === 1 ? 'hora' : 'horas'}`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `hace ${elapsedDays} ${elapsedDays === 1 ? 'día' : 'días'}`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
