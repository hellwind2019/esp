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
  database: "SensorData"
});
app.use(express.json())

connectDatabase(db);





app.get('/data', (req, res) =>{
  const {from, to} = req.query;
  console.log(req.query)
  if(!from || !to) return res.status(400).json({error : 'From and To not provided'})
    const query = `
      SELECT * 
      FROM DataTable
      WHERE record_time BETWEEN ? AND ?;
  `;
  db.query(query, [from, to], (err, results) => {
    if (err) {
        console.error('Ошибка выполнения запроса:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }

    // Отправка данных в ответ
    res.json(results);
});
})
app.get('/get-temperature-data', (req, res) => getTemperatureData(res, req, database));
app.get('/get-humidity-data', (req, res) => getHumidityData(res, req));

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
function getTemperatureData(res, req) {
  const query = 'SELECT record_time, sensor_value FROM DataTable WHERE sensor_type = "Temperature" ORDER BY record_time ASC';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });

}
function getHumidityData(res, req) {
  const query = 'SELECT record_time, sensor_value FROM DataTable WHERE sensor_type = "Humidity" ORDER BY record_time ASC';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });


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
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ message: 'Sensor data added successfully', recordId: results.insertId });
  });
}


