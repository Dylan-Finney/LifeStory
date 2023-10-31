export default toDateString = entryTime => {
  const date = new Date(entryTime);
  const today = new Date(Date.now());
  const yesterday = new Date(Date.now());
  yesterday.setDate(today.getDate() - 1);

  var dateText = '';
  const nthNumber = number => {
    if (number > 3 && number < 21) return 'th';
    switch (number % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  switch (date.toLocaleDateString()) {
    case today.toLocaleDateString():
      dateText = 'Today';
      break;
    case yesterday.toLocaleDateString():
      dateText = 'Yesterday';
      break;
    default:
      dateText = `${days[date.getDay()]} ${date.getDate()}${nthNumber(
        date.getDate(),
      )} ${date.toLocaleString('default', {
        month: 'short',
      })}. ${date.getFullYear()}`;
      break;
  }
  return dateText;
};
