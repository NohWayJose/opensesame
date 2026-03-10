const express = require('express');
const mqtt = require('mqtt');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const client = mqtt.connect('mqtt://192.168.7.245:1883', {
  reconnectPeriod: 3000,
  clientId: 'opensesame-' + Math.random().toString(16).substr(2, 8)
});

let isConnected = false;

client.on('connect', () => {
  console.log('Connected to MQTT broker');
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

app.post('/submit', (req, res) => {
  const code = req.body.code;
  console.log('Received code:', code);
  if (submissionCount < 5) {
    if (!isConnected) {
      console.log('Not connected to MQTT, waiting...');
      return res.json({ message: 'System not ready, try again' });
    }
    client.publish('opensesame', code, (err) => {
      if (err) {
        console.error('Publish error:', err);
        res.json({ message: 'Error publishing code' });
      } else {
        console.log('Published code to MQTT:', code);
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
