// Generate 6-digit event code
export const generate6DigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format date for display
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get event status
export const getEventStatus = (startTime, endTime) => {
  const now = new Date();
  const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
  const end = endTime.toDate ? endTime.toDate() : new Date(endTime);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'ended';
};

// Get status badge color
export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return '#2196F3'; // Blue
    case 'active':
      return '#4CAF50'; // Green
    case 'ended':
      return '#757575'; // Gray
    default:
      return '#757575';
  }
};

const toDate = (v) => {
  if (!v) return null;
  return v.toDate ? v.toDate() : new Date(v);
};

/**
 * Get the date/time when event photos become visible (for "after" reveal).
 * Returns null if reveal is "during" (real time).
 */
export const getPhotosRevealTime = (event) => {
  if (!event || event.revealPhotos === 'during') return null;
  const endTime = toDate(event.endTime);
  if (!endTime) return null;
  if (event.revealAfter === '12h') return new Date(endTime.getTime() + 12 * 60 * 60 * 1000);
  if (event.revealAfter === '24h') return new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
  if (event.revealAfter === 'custom' && event.customRevealDate) return toDate(event.customRevealDate);
  return null;
};

/**
 * Whether the user can view event photos (based on reveal setting and current time).
 */
export const canViewEventPhotos = (event) => {
  if (!event) return false;
  const now = new Date();
  if (event.revealPhotos === 'during') {
    const start = toDate(event.startTime);
    return start ? now >= start : true;
  }
  const revealTime = getPhotosRevealTime(event);
  return revealTime ? now >= revealTime : false;
};

/**
 * Human-readable message for when photos will be or are visible.
 */
export const getPhotosRevealMessage = (event) => {
  if (!event) return 'Photos will appear after the event.';
  if (event.revealPhotos === 'during') return 'Photos are visible during and after the event.';
  const revealTime = getPhotosRevealTime(event);
  if (!revealTime) return 'Photos will appear after the event ends.';
  return `Photos will be visible on ${revealTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
};

