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

app.post('/api/update-self', async (req, res) => {
  const { filePath, newContent, commitMessage } = req.body;
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.writeFileSync(fullPath, newContent);

    // Set Git identity every time (globally, so it sticks in ephemeral environments)
    await git.addConfig('user.name', 'Architect SSA', false, 'global');
    await git.addConfig('user.email', 'architect@ssa.ai', false, 'global');

    await git.add(filePath);
    await git.commit(commitMessage || "Auto-update from SSA");
    await git.push('origin', 'main');

    res.json({ message: "✅ Self-updated, committed, and pushed: " + filePath });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update self: " + err.message });
  }
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
    await git.commit(commitMessage || "Auto-update from SSA");
    await git.push('origin', 'main'); // ✅ Auto-push
    res.json({ message: "✅ Self-updated, committed, and pushed: " + filePath });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update and push: " + err.message });
  }
});

app.post('/api/evolve', async (req, res) => {
  const { instruction } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{
        role: "user",
        content: "Given the following instruction, respond ONLY with updated JavaScript code to replace the full content of app.js:

Instruction:
" + instruction
      }]
    });

    const newCode = completion.choices[0].message.content;
    const filePath = "app.js";
    const fullPath = path.join(__dirname, filePath);
    fs.writeFileSync(fullPath, newCode);
    await git.addConfig('user.name', 'Architect SSA');
    await git.addConfig('user.email', 'architect@ssa.ai');
    await git.add(filePath);
    await git.commit("Evolve: " + instruction);
    await git.push('origin', 'main');

    res.json({ message: "✅ SSA evolved with instruction and deployed." });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to evolve: " + err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🧠 Architect SSA v4.1 running at http://localhost:" + PORT);
});
