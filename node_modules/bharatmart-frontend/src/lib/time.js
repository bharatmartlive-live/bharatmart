export function getIndiaHour() {
  const parts = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  }).formatToParts(new Date());

  return Number(parts.find((part) => part.type === 'hour')?.value || 12);
}

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
