// const {default: generateMemories} = require('../src/utils/generateMemories');
const AWS = require('aws-sdk');
// import Config from 'react-native-config';

const {OpenAIApi} = require('openai');
import useDatabaseHooks from '../src/utils/hooks/useDatabaseHooks';
import generateMemories from '../src/utils/generateMemories';
jest.mock('../src/utils/hooks/useDatabaseHooks');
jest.mock('openai');
jest.mock('aws-sdk');
jest.mock('react-native-config', () => ({
  AWS_ACCESS_KEY: '',
  AWS_SECRET_KEY: '',
  AWS_REGION: '',
  OPENAI_KEY: '',
}));
describe('generateMemories', () => {
  useDatabaseHooks.mockReturnValue({
    createVisitsTable: jest.fn(),
    createRoutePointsTable: jest.fn(),
    deleteTable: jest.fn(),
    insertData: jest.fn(),
    insertRoutePointsData: jest.fn(),
    retrieveData: jest.fn(),
    retrieveSpecificRecord: jest.fn(),
    retrievePreviousVisitWithDeparture: jest.fn().mockReturnValue([]),
    retrievePreviousVisitWithoutDeparture: jest.fn().mockReturnValue([]),
    createEntryTable: jest.fn(),
    createMemoriesTable: jest.fn().mockReturnValue({}),
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
    getGlossaryItemsOfType: jest
      .fn()
      .mockReturnValue([{type: 'Location', alias: 'Home', data: '16'}]),
  });
  OpenAIApi.mockReturnValue({
    createChatCompletion: jest.fn().mockReturnValue({
      data: {choices: [{message: {content: 'Test OpenAI response'}}]},
    }),
  });
  // Config.mockReturnValue({
  console.log(useDatabaseHooks);
  // });
  it('testing', async () => {
    expect(
      await generateMemories({
        data: {
          locations: [
            {
              city: undefined,
              description:
                "1 Horse Guards Road, 1 Horse Guards Road, London, SW1A, England @ <+51.50468700,-0.12851600> +/- 100.00m, region CLCircularRegion (identifier:'<+51.50447000,-0.12922354> radius 70.76', center:<+51.50447000,-0.12922354>, radius:70.76m)",
              end: 1704985918000,
              id: 1,
              latitude: 51.504687,
              longitude: -0.128516,
              start: 1704983369000,
            },
            {
              city: undefined,
              description:
                "1 Horse Guards Road, 1 Horse Guards Road, London, SW1A, England @ <+51.50468700,-0.12851600> +/- 100.00m, region CLCircularRegion (identifier:'<+51.50447000,-0.12922354> radius 70.76', center:<+51.50447000,-0.12922354>, radius:70.76m)",
              end: null,
              id: 2,
              latitude: 51.504687,
              longitude: -0.128516,
              start: 1704985960000,
            },
          ],
          events: [],
          photosGroups: [],
        },
      }),
    ).toStrictEqual(
      expect.arrayContaining([
        {
          body: 'Test OpenAI response',
          bodyModifiedAt: 1704985918000,
          bodyModifiedSource: 'auto',
          emotion: 0,
          eventsData: {
            city: undefined,
            description: '1 Horse Guards Road',
            end: 1704985918000,
            id: 1,
            latitude: 51.504687,
            longitude: -0.128516,
            start: 1704983369000,
          },
          tags: [],
          time: 1704985918000,
          type: 1,
          vote: 0,
        },
      ]),
    );
  });
});
