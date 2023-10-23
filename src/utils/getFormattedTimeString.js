const getFormatedTimeString = (time1, time2 = null) => {
  const date = new Date(time1);
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = '0' + date.getMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? '0' + hours : 12;
  // Seconds part from the timestamp
  var formattedTime =
    hours.toString().slice(-2) +
    ':' +
    minutes.toString().slice(-2) +
    ' ' +
    ampm;
  if (time2 === null) {
    return formattedTime;
  } else {
    return `${formattedTime}-${getFormatedTimeString(time2)}`;
  }
};

export default getFormatedTimeString;
