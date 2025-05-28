const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/send-email', (req, res) => {
  const { to, subject, name, email, templateName } = req.body;

  // Cargar plantilla
  let template = fs.readFileSync(`./templates/${templateName}.html`, 'utf8');

  // Reemplazar marcadores en plantilla
  template = template.replace('{{nombre}}', name);
  template = template.replace('{{correo}}', email);

  // Guardar contenido en archivo temporal
  const tempPath = '/tmp/email.html';
  fs.writeFileSync(tempPath, template);

  // Enviar con mutt
  const cmd = `mutt -e "set content_type=text/html" -s "${subject}" ${to} < ${tempPath}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    res.json({ success: true, message: 'Email sent' });
  });
});

app.listen(port, () => {
  console.log(`Email API listening on port ${port}`);
});
