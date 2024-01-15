import toDateString from '../src/utils/toDateString';
import {parseLink} from '../src/utils/parseLink';
import getFormatedTimeString from '../src/utils/getFormattedTimeString';
import getDifferenceUnit from '../src/utils/getDifferenceTime';
import getMemories from '../src/utils/getMemories';
import isMemoryReadyToGenerate from '../src/utils/isMemoryReadyToGenerate';
import useDatabaseHooks from '../src/utils/hooks/useDatabaseHooks';
import useSettingsHooks from '../src/utils/hooks/useSettingsHooks';
import getNextMemoryTime from '../src/utils/getNextMemoryTime';
jest.mock('../src/utils/hooks/useDatabaseHooks');
jest.mock('../src/utils/hooks/useSettingsHooks');

describe('to Date String', () => {
  it('Today', () => {
    expect(toDateString(Date.now())).toBe('Today');
  });
  it('Yesterday', () => {
    expect(toDateString(new Date(Date.now() - 86400000))).toBe('Yesterday');
  });
  it('Random Date', () => {
    expect(toDateString(0)).toBe('Thursday 1st Jan. 1970');
  });
});

describe('ParseLink', () => {
  it('No Change', () => {
    expect(parseLink('https://www.google.com')).toBe('https://www.google.com');
  });
  it('http', () => {
    expect(parseLink('http://www.google.com')).toBe('https://www.google.com');
  });
  it('No protocol', () => {
    expect(parseLink('www.google.com')).toBe('https://www.google.com');
  });
});

describe('getFormatedTimeString', () => {
  const baseDate = new Date();
  baseDate.setFullYear(1970);
  baseDate.setDate(1);
  baseDate.setMonth(1);
  baseDate.setHours(1);
  baseDate.setMinutes(0);
  it('1 Time', () => {
    const oneAm = new Date(baseDate.getTime());
    expect(getFormatedTimeString(oneAm.getTime())).toBe(`01:00 AM`);
  });
  it('2 Time', () => {
    const oneAm = new Date(baseDate.getTime());
    expect(
      getFormatedTimeString(oneAm.getTime(), oneAm.getTime() + 3600000),
    ).toBe(`01:00 AM-02:00 AM`);
  });
  // newDate.setHours(13);
  it('PM', () => {
    const onePm = new Date(baseDate.getTime());
    onePm.setHours(13);
    expect(getFormatedTimeString(onePm.getTime())).toBe(`01:00 PM`);
  });
  it('AM-PM', () => {
    const elevenAm = new Date(baseDate.getTime());
    elevenAm.setHours(11);
    expect(
      getFormatedTimeString(elevenAm.getTime(), elevenAm.getTime() + 3600000),
    ).toBe(`11:00 AM-12:00 PM`);
  });
});

describe('getDifferenceUnit', () => {
  it('week ', () => {
    expect(getDifferenceUnit(604800000)).toBe('1wk');
  });
  it('day', () => {
    expect(getDifferenceUnit(86400000)).toBe('1d');
  });
  it('hour', () => {
    expect(getDifferenceUnit(3600000)).toBe('1h');
  });
  it('minute', () => {
    expect(getDifferenceUnit(60000)).toBe('1m');
  });
});

describe('isMemoryReadyToGenerate', () => {
  describe('22:00:00 and 07:59:59', () => {
    it('Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(22);
      lastTime.setHours(21);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(true);
    });

    it('Not Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(22);
      lastTime.setHours(22);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(false);
    });
    it('Ready during period - different day', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      lastTime.setDate(lastTime.getDate() - 1);
      currentTime.setHours(7);
      lastTime.setHours(21);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(true);
    });

    it('Not Ready during period - different day', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      lastTime.setDate(lastTime.getDate() - 1);
      currentTime.setHours(7);
      lastTime.setHours(22);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(false);
    });
  });

  describe('08:00:00 and 14:59:59', () => {
    it('Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(8);
      lastTime.setHours(7);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(true);
    });

    it('Not Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(8);
      lastTime.setHours(8);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(false);
    });
  });

  describe('15:00:00 and 21:59:59', () => {
    it('Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(15);
      lastTime.setHours(14);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(true);
    });

    it('Not Ready during period', () => {
      const currentTime = new Date(Date.now());
      const lastTime = new Date(Date.now());
      currentTime.setHours(15);
      lastTime.setHours(15);
      jest.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
      useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
      expect(isMemoryReadyToGenerate()).toBe(false);
    });
  });
});

describe('getNextMemoryTime', () => {
  it('3PM', () => {
    const lastTime = new Date(Date.now());
    lastTime.setHours(13);
    useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
    expect(getNextMemoryTime()).toBe('03:00 PM');
  });
  it('9AM', () => {
    const lastTime = new Date(Date.now());
    lastTime.setHours(6);
    useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
    expect(getNextMemoryTime()).toBe('08:00 AM');
  });
  it('22PM', () => {
    const lastTime = new Date(Date.now());
    lastTime.setHours(17);
    useSettingsHooks.getNumber.mockReturnValue(lastTime.getTime());
    expect(getNextMemoryTime()).toBe('10:00 PM');
  });
});

describe('getMemories', () => {
  const baseTags = {modes: [], other: [], roles: []};

  const baseObj = [
    {
      body: 'This is a test Calendar Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '{"calendarColor":"#1BADF8","start":"1702904400.0","title":"Work Meeting","end":"1702908000.0","calendar":"Calendar","isAllDay":"false"}',
      id: 0,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '2.0',
      vote: 0,
    },
    {
      body: 'This is a test Photo Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '{"creation":1702908000000,"lat":53.680542,"description":"17 Maple Street","lon":-2.7091994,"name":"IMG_0005.JPG","localIdentifier":"","data":"","labels":[{"Name":"Nature","Confidence":99.99983215332031,"Instances":[],"Parents":[{"Name":"Outdoors"}],"Aliases":[],"Categories":[{"Name":"Nature and Outdoors"}],"title":"Nature"}],"text":[]}',
      id: 1,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '0.0',
      vote: 0,
    },
    {
      body: 'This is a test Photo Group Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '[{"creation":1702908000000,"lat":53.680542,"description":"17 Maple Street","lon":-2.7091994,"name":"IMG_0005.JPG","localIdentifier":"","data":"","labels":[{"Name":"Nature","Confidence":99.99983215332031,"Instances":[],"Parents":[{"Name":"Outdoors"}],"Aliases":[],"Categories":[{"Name":"Nature and Outdoors"}],"title":"Nature"}],"text":[]},{"creation":1702908000000,"lat":53.680542,"description":"17 Maple Street","lon":-2.7091994,"name":"IMG_0005.JPG","localIdentifier":"","data":"","labels":[{"Name":"Nature","Confidence":99.99983215332031,"Instances":[],"Parents":[{"Name":"Outdoors"}],"Aliases":[],"Categories":[{"Name":"Nature and Outdoors"}],"title":"Nature"}],"text":[]}]',
      id: 2,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '3.0',
      vote: 0,
    },
    {
      body: 'This is a test Location Visit Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '{"description":"The British Museum","start":1702904400000,"end":1702908000000,"latitude":51.519419510713334,"longitude":-0.12670811167563512,"id":1, "city": "London"}',
      id: 3,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '1.0',
      vote: 0,
    },
    {
      body: 'This is a test Location Route (Complete) Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '{"start":{"description":"The British Museum","start":1702904400000,"recorded":1702908000000,"end":1702908000000,"lat":51.519419510713334,"lon":-0.12670811167563512,"city": "London"},"end":{"description":"Royal Opera House","start":1702909000000,"recorded":1702908000000,"end":1702920000000,"latitude":51.51302331971673,"longitude":-0.12221597740899726,"city": "London"},"points":[{"id": 1,"date": 1702908000001,"speed": 5,"lat": 51.51875421822659,"lon": -0.12859834267513925,"description": ""},{"id": 2,"date": 1702908000002,"speed": 5,"lat": 51.51691848526262,"lon": -0.12687240514161996,"description": ""},{"id": 3,"date": 1702908000003,"speed": 5,"lat": 51.515719102275334,"lon": -0.12665531840313538,"description": ""},{"id": 4,"date": 1702908000004,"speed": 5,"lat": 51.51508813063645,"lon": -0.1254880231494556,"description": ""},{"id": 5,"date": 1702908000005,"speed": 5,"lat": 51.51416767427219,"lon": -0.12405074487807598,"description": ""},{"id": 6,"date": 1702908000006,"speed": 5,"lat": 51.51394726197556,"lon": -0.12373624503076297,"description": ""},{"id": 7,"date": 1702908000007,"speed": 5,"lat": 51.513633873839346,"lon": -0.12277061647872774,"description": ""},{"id": 8,"date": 1702908000008,"speed": 5,"lat": 51.51330094676101,"lon": -0.1219978846845509,"description": ""}]}',
      id: 4,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '5.0',
      vote: 0,
    },
    {
      body: 'This is a test Location Route (Incomplete) Event',
      bodyModifiedAt: 1702908000000,
      bodyModifiedSource: 'auto',
      emotion: 0,
      eventsData:
        '{"start":{"description":"The British Museum","start":1702904400000,"recorded":1702908000000,"end":1702908000000,"lat":51.519419510713334,"lon":-0.12670811167563512,"city": "London"},"end":{"description":"Royal Opera House","start":1702909000000,"recorded":1702908000000,"end":1702920000000,"latitude":51.51302331971673,"longitude":-0.12221597740899726,"city": "London"},"points":[]}',
      id: 5,
      tags: JSON.stringify(baseTags),
      time: 1702908000000,
      type: '5.0',
      vote: 0,
    },
  ];

  const expectedObj = [
    {
      body: 'This is a test Calendar Event',
      type: 2,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 0,
      emotion: 0,
      eventsData: {
        end: '1702908000.0',
        start: '1702904400.0',
        title: 'Work Meeting',
        isAllDay: 'false',
        calendarColor: '#1BADF8',
        calendar: 'Calendar',
      },
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702904400000, 1702908000000),
    },
    {
      body: 'This is a test Photo Event',
      type: 0,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 1,
      emotion: 0,
      eventsData: {
        creation: 1702908000000,
        lat: 53.680542,
        description: '17 Maple Street',
        lon: -2.7091994,
        name: 'IMG_0005.JPG',
        localIdentifier: '',
        data: '',
        labels: [
          {
            Name: 'Nature',
            Confidence: 99.99983215332031,
            Instances: [],
            Parents: [{Name: 'Outdoors'}],
            Aliases: [],
            Categories: [{Name: 'Nature and Outdoors'}],
            title: 'Nature',
          },
        ],
        text: [],
      },
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702908000000),
    },
    {
      body: 'This is a test Photo Group Event',
      type: 3,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 2,
      emotion: 0,
      eventsData: [
        {
          creation: 1702908000000,
          lat: 53.680542,
          description: '17 Maple Street',
          lon: -2.7091994,
          name: 'IMG_0005.JPG',
          localIdentifier: '',
          data: '',
          labels: [
            {
              Name: 'Nature',
              Confidence: 99.99983215332031,
              Instances: [],
              Parents: [{Name: 'Outdoors'}],
              Aliases: [],
              Categories: [{Name: 'Nature and Outdoors'}],
              title: 'Nature',
            },
          ],
          text: [],
        },
        {
          creation: 1702908000000,
          lat: 53.680542,
          description: '17 Maple Street',
          lon: -2.7091994,
          name: 'IMG_0005.JPG',
          localIdentifier: '',
          data: '',
          labels: [
            {
              Name: 'Nature',
              Confidence: 99.99983215332031,
              Instances: [],
              Parents: [{Name: 'Outdoors'}],
              Aliases: [],
              Categories: [{Name: 'Nature and Outdoors'}],
              title: 'Nature',
            },
          ],
          text: [],
        },
      ],
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702908000000, 1702908000000),
    },
    {
      body: 'This is a test Location Visit Event',
      type: 1,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 3,
      emotion: 0,
      eventsData: {
        description: 'The British Museum',
        start: 1702904400000,
        end: 1702908000000,
        latitude: 51.519419510713334,
        longitude: -0.12670811167563512,
        id: 1,
        city: 'London',
      },
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702904400000, 1702908000000),
    },
    {
      body: 'This is a test Location Route (Complete) Event',
      type: 5,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 4,
      emotion: 0,
      eventsData: {
        start: {
          start: 1702904400000,
          recorded: 1702908000000,
          end: 1702908000000,
          lat: 51.519419510713334,
          lon: -0.12670811167563512,
          description: 'The British Museum',
          city: 'London',
        },
        end: {
          start: 1702909000000,
          recorded: 1702908000000,
          end: 1702920000000,
          latitude: 51.51302331971673,
          longitude: -0.12221597740899726,
          description: 'Royal Opera House',
          city: 'London',
        },
        points: [
          {
            id: 1,
            date: 1702908000001,
            speed: 5,
            lat: 51.51875421822659,
            lon: -0.12859834267513925,
            description: '',
          },
          {
            id: 2,
            date: 1702908000002,
            speed: 5,
            lat: 51.51691848526262,
            lon: -0.12687240514161996,
            description: '',
          },
          {
            id: 3,
            date: 1702908000003,
            speed: 5,
            lat: 51.515719102275334,
            lon: -0.12665531840313538,
            description: '',
          },
          {
            id: 4,
            date: 1702908000004,
            speed: 5,
            lat: 51.51508813063645,
            lon: -0.1254880231494556,
            description: '',
          },

          {
            id: 5,
            date: 1702908000005,
            speed: 5,
            lat: 51.51416767427219,
            lon: -0.12405074487807598,
            description: '',
          },

          {
            id: 6,
            date: 1702908000006,
            speed: 5,
            lat: 51.51394726197556,
            lon: -0.12373624503076297,
            description: '',
          },

          {
            id: 7,
            date: 1702908000007,
            speed: 5,
            lat: 51.513633873839346,
            lon: -0.12277061647872774,
            description: '',
          },
          {
            id: 8,
            date: 1702908000008,
            speed: 5,
            lat: 51.51330094676101,
            lon: -0.1219978846845509,
            description: '',
          },
        ],
      },
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702908000000, 1702909000000),
    },
    {
      body: 'This is a test Location Route (Incomplete) Event',
      type: 5,
      vote: 0,
      tags: baseTags,
      time: 1702908000000,
      id: 5,
      emotion: 0,
      eventsData: {
        start: {
          start: 1702904400000,
          recorded: 1702908000000,
          end: 1702908000000,
          lat: 51.519419510713334,
          lon: -0.12670811167563512,
          description: 'The British Museum',
          city: 'London',
        },
        end: {
          start: 1702909000000,
          recorded: 1702908000000,
          end: 1702920000000,
          latitude: 51.51302331971673,
          longitude: -0.12221597740899726,
          description: 'Royal Opera House',
          city: 'London',
        },
        points: [],
      },
      bodyModifiedSource: 'auto',
      bodyModifiedAt: 1702908000000,
      formattedTime: getFormatedTimeString(1702908000000, 1702909000000),
    },
  ];

  useDatabaseHooks.mockReturnValue({
    createVisitsTable: jest.fn(),
    createRoutePointsTable: jest.fn(),
    deleteTable: jest.fn(),
    insertData: jest.fn(),
    insertRoutePointsData: jest.fn(),
    retrieveData: jest.fn().mockReturnValue(baseObj),
    retrieveSpecificRecord: jest.fn(),
    retrievePreviousVisitWithDeparture: jest.fn(),
    retrievePreviousVisitWithoutDeparture: jest.fn(),
    createEntryTable: jest.fn(),
    createMemoriesTable: jest.fn(),
    saveMemoryData: jest.fn(),
    saveEntryData: jest.fn(),
    updateEntryData: jest.fn(),
    retrieveSpecificData: jest.fn(),
    resetTable: jest.fn(),
    retrieveRoutePointsForVisitData: jest.fn(),
    deleteMemoryData: jest.fn(),
    updateMemoryData: jest.fn(),
    retrieveLastVisit: jest.fn(),
    createGlossaryTable: jest.fn(),
    insertGlossaryItem: jest.fn(),
    updateGlossaryItem: jest.fn(),
    deleteGlossaryItem: jest.fn(),
    getGlossaryItemsOfType: jest.fn(),
  });
  it('format memories', async () => {
    // expect(await getMemories()).toEqual(expectedObj);
    expect(await getMemories()).toEqual(expect.arrayContaining(expectedObj));
  });
});
