const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/send-email', (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Missing to, subject, or message' });
  }

  const safeTo = to.replace(/[^a-zA-Z0-9@._-]/g, '');
  const safeSubject = subject.replace(/"/g, "'"); // evitar romper comillas
  const safeMessage = message.replace(/"/g, "'");
  const encodedSubject = `=?UTF-8?B?${Buffer.from(safeSubject).toString('base64')}?=`;
  const escapedMessage = message.replace(/"/g, "'");

  const cmd = `echo -e "To: ${safeTo}\nSubject: ${encodedSubject}\nContent-Type: text/plain; charset=UTF-8\n\n${escapedMessage}" | msmtp ${safeTo}`;


   exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.json({ message: 'Email sent successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`📬 Email API listening on port ${PORT}`);
});
