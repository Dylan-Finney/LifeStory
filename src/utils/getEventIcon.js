import LocationEventIcon from '../assets/event-location.svg';
import PhotoEventIcon from '../assets/event-photo.svg';
import CalendarEventIcon from '../assets/calendar-event.svg';
import LinkIcon from '../assets/LinkIcon.svg';
import {EventTypes} from './Enums';

export const getEventIcon = type => {
  switch (type) {
    case EventTypes.LOCATION:
    case EventTypes.LOCATION_ROUTE:
      return <LocationEventIcon />;
    case EventTypes.PHOTO:
    case EventTypes.PHOTO_GROUP:
      return <PhotoEventIcon />;
    case EventTypes.CALENDAR_EVENT:
      return <CalendarEventIcon />;
    case EventTypes.LINK:
      return <LinkIcon />;
  }
};
