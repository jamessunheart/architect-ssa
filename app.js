const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Chat Console UI
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>🧠 SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 300px; overflow-y: scroll; margin-bottom: 1rem; }
          input { width: 80%; }
        </style>
      </head>
      <body>
        <h1>🧠 SSA Console</h1>
        <div id="messages"></div>
        <input id="input" placeholder="Give SSA a new instruction..." />
        <button onclick="send()">Send</button>

        <script>
          const log = msg => {
            const el = document.createElement('div');
            el.textContent = msg;
            document.getElementById("messages").appendChild(el);
          };

          function send() {
            const instruction = document.getElementById("input").value;
            log("🧠 " + instruction);
            fetch("/api/evolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ instruction })
            })
            .then(res => res.json())
            .then(data => {
              if (data.error) log("❌ " + data.error);
              else log("✅ " + data.message);
            })
            .catch(err => log("❌ " + err.message));
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ Evolution Engine
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  const newCode = `\n// 🧠 SSA Evolution\n// ${instruction}\n`;

  try {
    // 1. Append new evolution instruction
    fs.appendFileSync("app.js", newCode);

    // 2. Git commit and push safely
    execSync("git add app.js", { stdio: "inherit" });
    execSync(`git commit -m "🧠 SSA evolved: ${instruction.replace(/"/g, "'")}"`, { stdio: "inherit" });
    execSync("git push", { stdio: "inherit" });

    res.json({ message: "SSA evolved and pushed to GitHub." });
  } catch (err) {
    console.error("❌ Evolution Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Base route
app.get("/", (req, res) => res.send("👋 SSA running. Visit /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA live on port ${port}`));
