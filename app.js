const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const git = simpleGit();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/projects', express.static(path.join(__dirname, 'projects')));

const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });

app.post('/api/build', async (req, res) => {
  const { prompt, integrations = [] } = req.body;
  const projectName = prompt.replace(/\\W+/g, '_').toLowerCase();
  const projectPath = path.join(projectsDir, projectName);
  if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });

  const integrationNote = integrations.length > 0
    ? "Integrate with: " + integrations.join(', ')
    : "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // ✅ GPT-4.1 (turbo variant)
      messages: [{
        role: "user",
        content: "Create a full index.html file (with JS and CSS) for this app idea: " + prompt + ". " + integrationNote + " Reply only with HTML code."
      }]
    });

    const htmlCode = completion.choices[0].message.content;
    fs.writeFileSync(path.join(projectPath, 'index.html'), htmlCode);
    res.json({ message: "✅ App created", url: "/projects/" + projectName + "/index.html" });
  } catch (error) {
    res.status(500).json({ error: "⚠️ Build error: " + error.message });
  }
});

app.post('/api/update-self', async (req, res) => {
  const { filePath, newContent, commitMessage } = req.body;
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.writeFileSync(fullPath, newContent);
    await git.addConfig('user.name', 'Architect SSA');
    await git.addConfig('user.email', 'architect@ssa.ai');
    await git.add(filePath);
    await git.commit(commitMessage || "Auto-update from SSA v4");
    res.json({ message: "✅ Self-updated and committed: " + filePath });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update self: " + err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Architect SSA v4 running at http://localhost:" + PORT);
});
