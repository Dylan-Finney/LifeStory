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

  // useEffect(() => {
  //   // deleteTable('Visits');
  //   createTable();
  // }, []);

  const createTable = () => {
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

  const retrieveData = (tableName, callback) => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM ${tableName}`, [], (tx, results) => {
        let data = [];
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
        callback(data);
      });
    });
  };

  const retrieveSpecificData = (startDate, endDate, callback) => {
    // var startOfDay = new Date(
    //   startDate.getFullYear(),
    //   startDate.getMonth(),
    //   startDate.getDate(),
    // );
    // var endOfDay = new Date(
    //   endDate.getFullYear(),
    //   endDate.getMonth(),
    //   endDate.getDate() - 1,
    // );
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
  const calculateAverage = (
    tableName,
    columnName,
    startDate,
    endDate,
    callback,
  ) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT AVG(${columnName}) as average FROM ${tableName} WHERE date BETWEEN ? AND ?`,
        [startDate.getTime(), endDate.getTime()],
        (tx, results) => {
          callback(results.rows.item(0).average);
        },
      );
    });
  };

  return {
    createTable,
    deleteTable,
    insertData,
    retrieveData,
    calculateAverage,
    retrieveSpecificData,
  };
};

export default useDatabaseHooks;
