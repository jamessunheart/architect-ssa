// SSA Evolution Engine
const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Console Interface
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 300px; overflow-y: scroll; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <h1>🧠 SSA Console</h1>
        <div id="messages"></div>
        <input id="input" placeholder="Give SSA a new instruction..." style="width: 80%" />
        <button onclick="send()">Send</button>
        <script>
          const log = msg => {
            document.getElementById('messages').innerHTML += "<div>" + msg + "</div>";
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
              .then(data => log("✅ " + data.message))
              .catch(err => log("❌ " + err.message));
          }
        </script>
      </body>
    </html>
  `);
});

// 🔹 Evolution Endpoint
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  const comment = `\n// 🧠 SSA Evolution: ${instruction}\n`;

  try {
    // 1. Append instruction to log
    fs.appendFileSync("evolution_log.txt", comment);

    // 2. Commit to GitHub
    fs.appendFileSync("app.js", comment); // Simulate evolving itself
    execSync("git add .");
    execSync(`git commit -m \"🧠 SSA evolved: ${instruction}\"`);
    execSync("git push");

    res.json({ message: "SSA evolved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evolution failed." });
  }
});

// 🔹 Root Endpoint
app.get("/", (req, res) => {
  res.send("✅ SSA is running. Visit /console to evolve.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 SSA listening on port ${port}`));
