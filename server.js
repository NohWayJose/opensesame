const express = require('express');
const mqtt = require('mqtt');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const MQTT_HOST = process.env.MQTT_HOST || '192.168.7.245';
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '1883', 10);
const MQTT_PROTOCOL = process.env.MQTT_PROTOCOL || 'mqtt';
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_URL = `${MQTT_PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`;

const mqttOptions = {
  reconnectPeriod: 3000,
  clientId: 'opensesame-' + Math.random().toString(16).substr(2, 8)
};

if (MQTT_USERNAME) mqttOptions.username = MQTT_USERNAME;
if (MQTT_PASSWORD) mqttOptions.password = MQTT_PASSWORD;

const client = mqtt.connect(MQTT_URL, mqttOptions);

const CODE_TOPIC = process.env.CODE_TOPIC || 'company/code';

let isConnected = false;

client.on('connect', () => {
  console.log('Connected to MQTT broker at', MQTT_URL);
  isConnected = true;
});

client.on('disconnect', () => {
  console.log('Disconnected from MQTT broker');
  isConnected = false;
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
  isConnected = false;
});

let submissionCount = 0;
let tryCount = 0;
let clients = []; // SSE clients

// Subscribe to trycount, reset and status topics
client.subscribe('opensesame/trycount', (err) => {
  if (err) console.error('Subscribe error:', err);
  else console.log('Subscribed to opensesame/trycount');
});

client.subscribe('opensesame/reset', (err) => {
  if (err) console.error('Subscribe error:', err);
  else console.log('Subscribed to opensesame/reset');
});

client.subscribe('opensesame/status', (err) => {
  if (err) console.error('Subscribe error:', err);
  else console.log('Subscribed to opensesame/status');
});

client.on('message', (topic, message) => {
  if (topic === 'opensesame/trycount') {
    const count = parseInt(message.toString());
    tryCount = count;
    console.log('Received trycount:', tryCount);
    // Broadcast to all connected SSE clients
    clients.forEach(client => {
      const out = Math.min(tryCount, 5);
      client.write(`data: ${JSON.stringify({ tryCount: out })}\n\n`);
    });
  } else if (topic === 'opensesame/reset') {
    const resetMsg = message.toString();
    console.log('Received reset message:', resetMsg);
    // reset the counter too
    tryCount = 0;
    // Broadcast reset message and updated tryCount to all connected SSE clients
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ resetMessage: resetMsg })}\n\n`);
      const out = Math.min(tryCount, 5);
      client.write(`data: ${JSON.stringify({ tryCount: out })}\n\n`);
    });
  } else if (topic === 'opensesame/status') {
    const statusMsg = message.toString();
    console.log('Received status message:', statusMsg);
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ status: statusMsg })}\n\n`);
    });
  }
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Send current count immediately
  res.write(`data: ${JSON.stringify({ tryCount })}\n\n`);
  // Add to clients list
  clients.push(res);
  // Remove on disconnect
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

app.post('/submit', (req, res) => {
  const code = req.body.code;
  console.log('Received code:', code);
  if (submissionCount < 5) {
    if (!isConnected) {
      console.log('Not connected to MQTT, waiting...');
      return res.json({ message: 'System not ready, try again' });
    }
    client.publish(CODE_TOPIC, code, (err) => {
      if (err) {
        console.error('Publish error:', err);
        res.json({ message: 'Error publishing code' });
      } else {
        console.log('Published code to MQTT topic', CODE_TOPIC + ':', code);
        submissionCount++;
        res.json({ success: true });
      }
    });
  } else {
    submissionCount = 0;
    console.log('Submission limit reached, counter reset to 0');
    res.json({ message: 'ring 0797 999 7237' });
  }
});

app.post('/restart', (req, res) => {
  submissionCount = 0;
  console.log('Counter manually reset to 0');
  res.json({ success: true, message: 'System reset' });
});

app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));

