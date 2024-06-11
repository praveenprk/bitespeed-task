const mysql = require('mysql2');

const connection = mysql.createConnection({
//   host: '127.0.0.1',      // Replace with your host
  user: 'root',           // Replace with your MySQL username
  password: '',   // Replace with your MySQL password
  database: 'bitespeed',
//   port: 3306,
  socketPath: '/tmp/mysql.sock'
});

connection.connect((err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to database');
  }
});

module.exports = connection;
