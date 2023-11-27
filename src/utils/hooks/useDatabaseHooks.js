import {useEffect} from 'react';
import SQLite from 'react-native-sqlite-storage';
const useDatabaseHooks = () => {
  const db = SQLite.openDatabase(
    {
      name: 'lifestory-database.db',
      createFromLocation: 1,
      location: 'default',
    },
    () => {
      console.log(`${Date.now()} Database opened successfully`);
    },
    error => {
      console.log('Error opening database:', error);
    },
  );

  // console.log('db', db);

  const deleteTable = tableName => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS ${tableName}`,
        [],
        (_, result) => {
          console.log('Table deleted successfully', result);
        },
        (_, error) => {
          console.log('Error deleting table:', error);
        },
      );
    });
  };

  const createEntryTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Entries (id INTEGER PRIMARY KEY AUTOINCREMENT, tags TEXT, title TEXT, time DATE, emotion INTEGER, vote INTEGER, bodyModifiedAt DATE, bodyModifiedSource TEXT, titleModifiedAt DATE, titleModifiedSource TEXT, events TEXT, body TEXT, showAsYesterday INTEGER);`,
      );
    });
  };

  const createMemoriesTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Memories (id INTEGER PRIMARY KEY AUTOINCREMENT, tags TEXT, type TEXT, time DATE, emotion INTEGER, vote INTEGER, bodyModifiedAt DATE, bodyModifiedSource TEXT, eventsData TEXT, body TEXT);`,
      );
    });
  };

  const createSettingsTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);`,
      );
    });
  };

  const createVisitsTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Visits (id INTEGER PRIMARY KEY AUTOINCREMENT, start DATE, end DATE, lat DECIMAL, lon DEMICAL, description TEXT);`,
      );
    });
  };

  const createRoutePointsTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS RoutePoints (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATE, speed DECIMAL, lat DECIMAL, lon DEMICAL, description TEXT);`,
      );
    });
  };

  const insertData = (start, end, lat, lon, description) => {
    db.transaction(tx => {
      if (end === 0) {
        tx.executeSql(
          `INSERT INTO Visits (start, lat, lon, description) VALUES (?, ?, ?, ?)`,
          [start, lat, lon, description],
          (_, result) => {
            console.log('Visit inserted successfully', result);
          },
          (_, error) => {
            console.log('Error inserting Visit:', error);
          },
        );
      } else {
        tx.executeSql(
          `INSERT INTO Visits (start, end, lat, lon, description) VALUES (?, ?, ?, ?, ?)`,
          [start, end, lat, lon, description],
          (_, result) => {
            console.log('Visit inserted successfully', result);
          },
          (_, error) => {
            console.log('Error inserting Visit:', error);
          },
        );
      }
    });
  };

  const insertRoutePointsData = (date, speed, lat, lon, description) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO RoutePoints (date, speed, lat, lon, description) VALUES (?, ?, ?, ?, ?)`,
        [date, speed, lat, lon, description],
        (_, result) => {
          console.log('RoutePoint successfully', result);
        },
        (_, error) => {
          console.log('Error inserting RoutePoint:', error);
        },
      );
    });
  };

  const saveEntryData = async ({
    tags,
    title,
    time,
    emotion,
    vote,
    bodyModifiedAt,
    bodyModifiedSource,
    titleModifiedAt,
    titleModifiedSource,
    events,
    body,
    showAsYesterday,
  }) => {
    console.log({
      tags,
      title,
      time,
      emotion,
      vote,
      bodyModifiedAt,
      bodyModifiedSource,
      titleModifiedAt,
      titleModifiedSource,
      events,
      showAsYesterday,
      body,
    });
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Entries (tags, title, time, emotion, vote, bodyModifiedAt, bodyModifiedSource, titleModifiedAt, titleModifiedSource, events, showAsYesterday, body) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tags,
            title,
            time,
            emotion,
            vote,
            bodyModifiedAt,
            bodyModifiedSource,
            titleModifiedAt,
            titleModifiedSource,
            events,
            showAsYesterday,
            body,
          ],
          (_, result) => {
            console.log('Entry created successfully', result);
            resolve(result);
          },
          (_, error) => {
            console.error('Error creating entry:', error);
            reject(error);
          },
        );
      });
    });
  };

  const saveMemoryData = async ({
    tags,
    time,
    type,
    emotion,
    vote,
    bodyModifiedAt,
    bodyModifiedSource,
    eventsData,
    body,
  }) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Memories (tags, type, time, emotion, vote, bodyModifiedAt, bodyModifiedSource, eventsData, body) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tags,
            type,
            time,
            emotion,
            vote,
            bodyModifiedAt,
            bodyModifiedSource,
            eventsData,
            body,
          ],
          (_, result) => {
            console.log('Memory created successfully', result);
            resolve(result);
          },
          (_, error) => {
            console.error('Error creating memory:', error);
            reject(error);
          },
        );
      });
    });
  };

  const saveSettingsData = data => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Settings (data) VALUES (?)`,
        [data],
        (_, result) => {
          console.log('Entry created successfully', result);
        },
        (_, error) => {
          console.log('Error creating entry:', error);
        },
      );
    });
  };

  const updateEntryData = (
    tags,
    title,
    time,
    emotion,
    vote,
    bodyModifiedAt,
    bodyModifiedSource,
    titleModifiedAt,
    titleModifiedSource,
    events,
    body,
    id,
  ) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Entries SET tags = ?, title = ?, time = ?, emotion = ?, vote = ?, bodyModifiedAt = ?, bodyModifiedSource = ?, titleModifiedAt = ?, titleModifiedSource = ?, events = ?, body = ? WHERE id = ?`,
        // `UPDATE Entries SET title = ? WHERE id = ?`,
        [
          tags,
          title,
          time,
          emotion,
          vote,
          bodyModifiedAt,
          bodyModifiedSource,
          titleModifiedAt,
          titleModifiedSource,
          events,
          body,
          id,
        ],
        (_, result) => {
          console.log('Data updated successfully', result);
        },
        (_, error) => {
          console.log('Error updating data:', error);
        },
      );
    });
  };

  const updateMemoryData = ({
    tags,
    time,
    type,
    emotion,
    vote,
    bodyModifiedAt,
    bodyModifiedSource,
    eventsData,
    body,
    id,
  }) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Memories SET tags = ?, type = ?, time = ?, emotion = ?, vote = ?, bodyModifiedAt = ?, bodyModifiedSource = ?, eventsData = ?, body = ?  WHERE id = ?`,
        // `UPDATE Entries SET title = ? WHERE id = ?`,
        [
          tags,
          type,

          time,
          emotion,
          vote,
          bodyModifiedAt,
          bodyModifiedSource,
          eventsData,
          body,
          id,
        ],
        (_, result) => {
          console.log('Data updated successfully', result);
        },
        (_, error) => {
          console.log('Error updating data:', error);
        },
      );
    });
  };

  const deleteMemoryData = ({id}) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM Memories WHERE id = ?`,
        // `UPDATE Entries SET title = ? WHERE id = ?`,
        [id],
        (_, result) => {
          console.log('Memory deleted successfully', result);
        },
        (_, error) => {
          console.log('Error updating data:', error);
        },
      );
    });
  };

  const retrieveData = async tableName => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(`SELECT * FROM ${tableName}`, [], (tx, results) => {
            console.log({results});
            let data = [];
            for (let i = 0; i < results.rows.length; i++) {
              data.push(results.rows.item(i));
            }
            resolve(data);
          });
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const retrieveSpecificRecord = async (tableName, id) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM ${tableName} WHERE id = ?`,
            [id],
            (tx, results) => {
              console.log({results});
              let data = null;
              for (let i = 0; i < results.rows.length; i++) {
                data = results.rows.item(i);
              }
              resolve(data);
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const resetTable = tableName => {
    db.transaction(tx => {
      tx.executeSql(`DELETE FROM ${tableName}`, [], (tx, results) => {
        console.log(`${tableName} RESET`, {results});
      });
    });
  };

  const retrieveSpecificData = (startDate, endDate, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Visits WHERE (Visits.end IS NULL AND Visits.start BETWEEN ? AND ?) OR (Visits.end IS NOT NULL AND Visits.end BETWEEN ? AND ?)`,
        [startDate, endDate, startDate, endDate],
        (tx, results) => {
          let data = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i));
          }
          callback(data);
        },
      );
    });
  };

  const retrievePreviousVisitWithDeparture = id => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM Visits WHERE id = (SELECT MAX(id) FROM Visits WHERE id < ? AND (Visits.end IS NOT NULL))`,
            [id],
            (tx, results) => {
              console.log({results});
              let data = [];
              for (let i = 0; i < results.rows.length; i++) {
                data.push(results.rows.item(i));
              }
              resolve(data);
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const retrieveLastVisit = async () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM Visits WHERE id = (SELECT MAX(id) FROM Visits WHERE (Visits.end IS NULL))`,
            [],
            (tx, results) => {
              console.log({results});
              let data = [];
              for (let i = 0; i < results.rows.length; i++) {
                data.push(results.rows.item(i));
              }
              resolve(data);
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const retrieveRoutePointsForVisitData = (startDate, endDate, callback) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM RoutePoints WHERE RoutePoints.date BETWEEN ? AND ?`,
            [startDate, endDate],
            (tx, results) => {
              console.log({results});
              let data = [];
              for (let i = 0; i < results.rows.length; i++) {
                data.push(results.rows.item(i));
              }
              resolve(data);
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const retrieveEntriesData = (startDate, endDate, callback) => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM Entries`, [], (tx, results) => {
        let data = [];
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
        callback(data);
      });
    });
  };

  return {
    createVisitsTable,
    createRoutePointsTable,
    deleteTable,
    insertData,
    insertRoutePointsData,
    retrieveData,
    retrieveSpecificRecord,
    retrievePreviousVisitWithDeparture,
    createEntryTable,
    createMemoriesTable,
    saveMemoryData,
    saveEntryData,
    updateEntryData,
    retrieveSpecificData,
    resetTable,
    retrieveRoutePointsForVisitData,
    deleteMemoryData,
    updateMemoryData,
    retrieveLastVisit,
  };
};

export default useDatabaseHooks;
