export const parseLink = url => {
  if (!url.startsWith('https')) {
    if (url.startsWith('http')) {
      return 'https' + url.substring(4, url.length);
    } else {
      return 'https://' + url;
    }
  }
  return url;
};
