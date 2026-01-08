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

