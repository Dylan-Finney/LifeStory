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
        `CREATE TABLE IF NOT EXISTS Entries (id INTEGER PRIMARY KEY AUTOINCREMENT, tags TEXT, title TEXT, time DATE, emotion INTEGER, emotions TEXT, votes TEXT, bodyModifiedAt DATE, bodyModifiedSource TEXT, titleModifiedAt DATE, titleModifiedSource TEXT, events TEXT, body TEXT, generated INTEGER);`,
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
        `CREATE TABLE IF NOT EXISTS Visits (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATE, lat DECIMAL, lon DEMICAL, description TEXT);`,
      );
    });
  };

  const insertData = (date, lat, lon, description) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Visits (date, lat, lon, description) VALUES (?, ?, ?, ?)`,
        [date, lat, lon, description],
        (_, result) => {
          console.log('Data inserted successfully', result);
        },
        (_, error) => {
          console.log('Error inserting data:', error);
        },
      );
    });
  };

  const saveEntryData = ({
    tags,
    title,
    time,
    emotion,
    emotions,
    votes,
    bodyModifiedAt,
    bodyModifiedSource,
    titleModifiedAt,
    titleModifiedSource,
    events,
    body,
    generated,
  }) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Entries (tags, title, time, emotion, emotions, votes, bodyModifiedAt, bodyModifiedSource, titleModifiedAt, titleModifiedSource, events, body, generated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tags,
          title,
          time,
          emotion,
          emotions,
          votes,
          bodyModifiedAt,
          bodyModifiedSource,
          titleModifiedAt,
          titleModifiedSource,
          events,
          body,
          generated,
        ],
        (_, result) => {
          console.log('Entry created successfully', result);
        },
        (_, error) => {
          console.log('Error creating entry:', error);
        },
      );
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
    emotions,
    votes,
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
        `UPDATE Entries SET tags = ?, title = ?, time = ?, emotion = ?, emotions = ?, votes = ?, bodyModifiedAt = ?, bodyModifiedSource = ?, titleModifiedAt = ?, titleModifiedSource = ?, events = ?, body = ? WHERE id = ?`,
        // `UPDATE Entries SET title = ? WHERE id = ?`,
        [
          tags,
          title,
          time,
          emotion,
          emotions,
          votes,
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

  const retrieveData = async tableName => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(`SELECT * FROM ${tableName}`, [], (tx, results) => {
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
        `SELECT * FROM Visits WHERE Visits.date BETWEEN ? AND ?`,
        [startDate, endDate],
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
    deleteTable,
    insertData,
    retrieveData,
    createEntryTable,
    saveEntryData,
    updateEntryData,
    retrieveSpecificData,
    resetTable,
  };
};

export default useDatabaseHooks;
