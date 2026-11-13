export function getDateSeed(date = new Date()) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}

export function formatShortDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getCurrentStreak(activityDates, today = new Date()) {
  const activeDates = new Set(activityDates);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!activeDates.has(getLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  if (!activeDates.has(getLocalDateKey(cursor))) {
    return 0;
  }

  let streak = 0;

  while (activeDates.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
