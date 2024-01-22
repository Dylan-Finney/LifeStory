export const wasPhotoTaken = photo => {
  console.log('wasPhotoTaken', {photo: {...photo, data: ''}});
  return photo.loc !== 'null' ? true : photo.name === photo.name.toUpperCase();
};
