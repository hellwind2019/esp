const { log } = require('console');
const http = require('http');
let sensorData = { "sensorValue": 45 };  // Переменная для хранения данных, полученных от ESP32
const bodyParser = require('body-parser');


const express = require('express')
var mysql = require('mysql')
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
db.connect(function (err) {
  if (err) throw err;
  db.query("select * from DataTable", function (err, result, fields) {
    if (err) throw err;
    console.log(result)
  })
})
app.use(bodyParser.json())
//Send JSON from entire table
app.get('/api/data', (req, res) => {
  const limit = parseInt(req.query.count) || 10;
  
  const query = 'SELECT * FROM DataTable WHERE  ORDER BY id DESC LIMIT ?';

  db.query(query, [limit], (err, results) => {
    if (err) {
      console.error('Error getting value from server:', err.stack);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

app.get('/get-temperature-data', (req, res) => {
  const query = 'SELECT record_time, sensor_value FROM DataTable WHERE sensor_type = "Temperature" ORDER BY record_time ASC';
  db.query(query, (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }
      res.json(results);
  });
});
app.get('/get-humidity-data', (req, res) => {
  const query = 'SELECT record_time, sensor_value FROM DataTable WHERE sensor_type = "Humidity" ORDER BY record_time ASC';
  db.query(query, (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }
      res.json(results);
  });
});

app.post('/add-sensor-data', (req, res) => {
    const {sensor_type, sensor_value } = req.body; // Извлечение данных из тела запроса

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
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});


