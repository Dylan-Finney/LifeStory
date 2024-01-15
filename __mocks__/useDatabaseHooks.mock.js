const useDatabaseHooks = () => {
  return {
    createVisitsTable: () => {},
    createRoutePointsTable: () => {},
    deleteTable: () => {},
    insertData: () => {},
    insertRoutePointsData: () => {},
    retrieveData: () => {},
    retrieveSpecificRecord: () => {},
    retrievePreviousVisitWithDeparture: () => {},
    retrievePreviousVisitWithoutDeparture: () => {},
    createEntryTable: () => {},
    createMemoriesTable: () => {},
    saveMemoryData: () => {},
    saveEntryData: () => {},
    updateEntryData: () => {},
    retrieveSpecificData: () => {},
    resetTable: () => {},
    retrieveRoutePointsForVisitData: () => {},
    deleteMemoryData: () => {},
    updateMemoryData: () => {},
    retrieveLastVisit: () => {},
    createGlossaryTable: () => {},
    insertGlossaryItem: () => {},
    updateGlossaryItem: () => {},
    deleteGlossaryItem: () => {},
    getGlossaryItemsOfType: () => {},
  };
};
export default useDatabaseHooks;