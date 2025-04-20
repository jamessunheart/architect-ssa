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

// 🔨 Build new app from prompt
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
      model: "gpt-4-turbo", // ✅ GPT-4.1
      messages: [{
        role: "user",
        content: `Create a full index.html file (with JS and CSS) for this app idea: "${prompt}". ${integrationNote} Reply only with valid HTML.`
      }]
    });

    const htmlCode = completion.choices[0].message.content;
    fs.writeFileSync(path.join(projectPath, 'index.html'), htmlCode);
    res.json({ message: "✅ App created", url: `/projects/${projectName}/index.html` });
  } catch (error) {
    res.status(500).json({ error: "⚠️ Build error: " + error.message });
  }
});

// 🔁 Update self with new content
app.post('/api/update-self', async (req, res) => {
  const { filePath, newContent, commitMessage } = req.body;
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.writeFileSync(fullPath, newContent);
    await git.addConfig('user.name', 'Architect SSA', false, 'global');
    await git.addConfig('user.email', 'architect@ssa.ai', false, 'global');

    try {
      await git.remote(['get-url', 'origin']);
    } catch {
      await git.addRemote('origin', 'git@github.com:jamessunheart/architect-ssa.git');
    }

    await git.add(filePath);
    await git.commit(commitMessage || "Auto-update from SSA");
    await git.push('origin', 'main');

    res.json({ message: `✅ Self-updated, committed, and pushed: ${filePath}` });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update self: " + err.message });
  }
});

// 🧠 Recursively evolve by GPT
app.post('/api/evolve', async (req, res) => {
  const { instruction } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{
        role: "user",
        content: `You are the live backend of an evolving AI system. Based on this instruction, return ONLY the full updated JavaScript code for the entire content of app.js:\n\nInstruction: "${instruction}"`
      }]
    });

    const newCode = completion.choices[0].message.content;
    const filePath = "app.js";
    const fullPath = path.join(__dirname, filePath);

    fs.writeFileSync(fullPath, newCode);
    await git.addConfig('user.name', 'Architect SSA', false, 'global');
    await git.addConfig('user.email', 'architect@ssa.ai', false, 'global');

    try {
      await git.remote(['get-url', 'origin']);
    } catch {
      await git.addRemote('origin', 'git@github.com:jamessunheart/architect-ssa.git');
    }

    await git.add(filePath);
    await git.commit(`Evolve: ${instruction}`);
    await git.push('origin', 'main');

    res.json({ message: "✅ SSA evolved and redeployed successfully." });
  } catch (err) {
    res.status(500).json({ error: "❌ Evolution failed: " + err.message });
  }
});

// 🏠 Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 SSA v5 running at http://localhost:${PORT}`);
});
