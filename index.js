const WebSocket = require('ws');
const mqtt = require("mqtt");
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.post("/api/dashboard", (req, res) => {
  res.send(daftarIdOnline);
});
app.post("/api/clear", (req, res) => {
  let topicPub = "alert/server/1";
  client.publish(topicPub, '{"FUNC":"ALARM","DATA":"CLR"}');
  console.log('{"FUNC":"TRG","DATA":"CLR}');
  client.publish(topicPub, '{"FUNC":"SIRINE","DATA":"OFF"}');
  console.log('{"FUNC":"SIRINE","DATA":"OFF"}');
  res.send("HTTP CONNECTED");
});

var daftarIdOnline = [];
var jumlahId = 0;

const client = mqtt.connect("mqtt://103.146.203.230");
var msg_str = "";

// const wsPort = process.env.PORT || 8080;

const server = new WebSocket.Server({ port: 8080 });

var index_t = 0;
var counter = 1;

client.on("connect", () => {
  client.subscribe('#', (err) => {
    if (!err) {
      console.log('MQTT SUBSCRIBING TO #');
    }
  });
});

server.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  client.on('message', function (topic, message) {
    // console.log(message.toString());
    if (message.indexOf("ASM") > -1) {
      socket.send(message.toString());
      // index_t++;
      // console.log(index_t);
      // msg_str = message.toString();
      // console.log(msg_str);
      // const dataMQTT = JSON.parse(msg_str);
      // if (!daftarIdOnline.find((daftarIdOnline) => daftarIdOnline.ID === dataMQTT.ID)) {
      //   daftarIdOnline[jumlahId] = dataMQTT;
      //   jumlahId++;
      //   console.log('list++');
      // }
    }
  })
});

setInterval(() => {
  // Menambahkan counter
  counter++;
  index_t++;
  var mode = 'NORMAL';

  if ((index_t > 0) && (index_t < 10)) {
    mode = 'MODE_1';
  }
  if ((index_t > 9) && (index_t < 20)) {
    mode = 'MODE_2';
  }
  if (index_t > 29) {
    index_t = 0;
  }
  // Topik dan payload data
  const topic = 'alert/device/1';
  var payload = `{"ID":"ASM230300${counter}","IP":"192.168.100.10${counter}","STATUS":"${mode}"}`;
  if (counter > 4) {
    counter = 1;
  }
  // Mengirim data ke broker
  // client.publish(topic, payload, (error) => {
  //   if (error) {
  //     console.error('Terjadi kesalahan saat mengirim data:', error);
  //   } else {
  //     console.log(`Data terkirim: ${payload}`);
  //   }
  // });
}, 1000);

var data_terakhir = "";

const port = process.env.PORT || 3003;

app.listen(port, function () {
  console.log(`Server berjalan pada port ${port}`);
});
