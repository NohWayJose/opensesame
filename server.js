const express = require('express');
const mqtt = require('mqtt');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const client = mqtt.connect('mqtt://192.168.7.245:1883');

let submissionCount = 0;

app.post('/submit', (req, res) => {
  const code = req.body.code;
  if (submissionCount < 5) {
    client.publish('opensesame', code);
    submissionCount++;
    res.json({ success: true });
  } else {
    res.json({ message: 'ring 0797 999 7237' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
