const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());
app.use(express.static('public'));

const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir);

app.post('/api/build', async (req, res) => {
  const { prompt, integrations = [] } = req.body;
  const projectName = prompt.replace(/\W+/g, '_').toLowerCase();
  const projectPath = path.join(projectsDir, projectName);
  if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });

  const integrationNote = integrations.length > 0
    ? `Integrate with the following APIs: ${integrations.join(', ')}`
    : '';

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: \`Create a full index.html file (with JS and CSS) for this app idea: "\${prompt}". \${integrationNote} Reply only with HTML code.\`
      }]
    });

    const htmlCode = completion.choices[0].message.content;
    fs.writeFileSync(path.join(projectPath, 'index.html'), htmlCode);
    res.json({ message: "✅ App created", url: \`/projects/\${projectName}/index.html\` });
  } catch (error) {
    console.error("❌ Build Error:", error.message);
    res.status(500).json({ error: "⚠️ Error building app: " + error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`🧠 Architect SSA v3 running at http://localhost:\${PORT}\`));