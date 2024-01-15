import getBestLocationTag from '../src/utils/getBestLocationTag';
import useDatabaseHooks from '../src/utils/hooks/useDatabaseHooks';
jest.mock('../src/utils/hooks/useDatabaseHooks');
// import SQLite from 'react-native-sqlite-storage';
describe('Best Location Name', () => {
  console.log(useDatabaseHooks);
  useDatabaseHooks.mockReturnValue({
    createVisitsTable: jest.fn(),
    createRoutePointsTable: jest.fn(),
    deleteTable: jest.fn(),
    insertData: jest.fn(),
    insertRoutePointsData: jest.fn(),
    retrieveData: jest.fn(),
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
    getGlossaryItemsOfType: jest
      .fn()
      .mockReturnValue([{type: 'Location', alias: 'Home', data: '16'}]),
  });
  it('Chose City Over Residential', async () => {
    expect(await getBestLocationTag({description: '15', city: 'London'})).toBe(
      'London',
    );
  });
  it('Chose Residential Over City (Glossary Location)', async () => {
    expect(await getBestLocationTag({description: '16', city: 'London'})).toBe(
      'Home',
    );
  });
  it('Chose Building Over City', async () => {
    expect(
      await getBestLocationTag({
        description: 'The Airport',
        city: 'London',
      }),
    ).toBe('The Airport');
  });
});
