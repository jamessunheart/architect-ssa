const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Console UI
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 200px; overflow-y: scroll; margin-bottom: 1rem; }
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

// ✅ Evolution endpoint
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  console.log("🧠 Instruction received:", instruction);

  const match = instruction.match(/Add a GET route at (.*?) that returns (\{.*\})/);
  if (!match) {
    return res.status(400).json({ error: "❌ Could not parse instruction." });
  }

  const route = match[1].trim();
  const responseObj = match[2];

  const codeToAdd = `\n// 🔁 Auto-added route\napp.get(\"${route}\", (req, res) => res.json(${responseObj}));\n`;

  try {
    fs.appendFileSync(path.join(__dirname, "app.js"), codeToAdd);
    execSync("git add app.js");
    execSync(`git commit -m \"🧠 Evolved: ${instruction}\"`);
    execSync("git push");

    res.json({ message: `Evolved and deployed route ${route}` });
  } catch (err) {
    console.error("❌ Evolution error:", err);
    res.status(500).json({ error: "Evolution failed." });
  }
});

// ✅ Root
app.get("/", (req, res) => res.send("👋 SSA is live. Go to /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
