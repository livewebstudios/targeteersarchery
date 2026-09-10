/**
 * Hours tables are rendered at build time, so "today" is whichever day the
 * build ran. This re-marks the right row using the store's own timezone.
 * Imported by both HoursTable and the footer; the module is bundled once.
 */
const ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function markToday() {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
  }).format(new Date());
  const index = ORDER.indexOf(wd);
  if (index < 0) return;
  for (const table of document.querySelectorAll('[data-hours-table]')) {
    table.querySelectorAll('tbody tr').forEach((row, i) => {
      row.toggleAttribute('data-today', i === index);
    });
  }
}

markToday();
document.addEventListener('astro:after-swap', markToday);
