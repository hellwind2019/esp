const { log, error } = require('console');
const http = require('http');
let sensorData = { "sensorValue": 45 };  // Переменная для хранения данных, полученных от ESP32
const bodyParser = require('body-parser');

const express = require('express')
var mysql = require('mysql');
const { default: database } = require('mime-db');
const app = express()
const port = 6969;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "admin",
  database: "SensorTable"
});
app.use(express.json())

connectDatabase(db);





app.get('/data', (req, res) => {
  const { from, to, type, avg } = req.query;
  let params = []
  let query = ``
  console.log(req.query)
  if (avg) {
    query = `
      WITH numbered_data AS (
        SELECT 
            id,
            record_time,
            sensor_type,
            sensor_value,
            ROW_NUMBER() OVER (ORDER BY record_time) AS row_num
        FROM DataTable
        WHERE record_time BETWEEN ? AND ?
        AND sensor_value > 0
        AND sensor_type = ?
      ),
      grouped_data AS (
          SELECT 
              MIN(id) AS id,
              MIN(record_time) AS record_time,
              MIN(sensor_type) AS sensor_type,  -- Aggregating sensor_type
              AVG(sensor_value) AS sensor_value
          FROM numbered_data
          GROUP BY CEIL(row_num / ?)
      )
      SELECT 
          id,
          record_time,
          sensor_type,
          sensor_value
      FROM grouped_data
      ORDER BY id;
    `
    params = [from, to, type, avg]
  }else{
    query = `
    SELECT * 
    FROM DataTable
    WHERE record_time BETWEEN ? AND ?
    AND sensor_type = ?
    AND sensor_value > 0
    ;`;
    params = [from, to, type]
  }
  if (!from || !to || !type) return res.status(400).json({ error: 'Arguments not provided' })
 
 
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    // Отправка данных в ответ
    res.json(results);
  });
})
app.post('/add-sensor-data', (req, res) => addSendorData(res, req));

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
})


function connectDatabase(database) {
  database.connect(function (err) {
    if (err) throw err;
    database.query("select * from DataTable", function (err, result, fields) {
      if (err) throw err;
    })
  })
}
function addSendorData(res, req) {
  const { sensor_type, sensor_value } = req.body; // Извлечение данных из тела запроса

  // Проверяем наличие данных
  if (!sensor_type || sensor_value === undefined) {
    return res.status(400).json({ error: 'Sensor type and sensor value are required' });
  }

  // SQL-запрос для вставки данных
  const query = 'INSERT INTO DataTable (sensor_type, sensor_value) VALUES (?, ?)';

  // Выполняем запрос
  db.query(query, [sensor_type, sensor_value], (error, results) => {
    if (error) {
      console.log(error.message);

      return res.status(500).json({ error: error.message });

    }
    console.log(results.insertId);

    res.status(201).json({ message: 'Sensor data added successfully', recordId: results.insertId });
  });
}


