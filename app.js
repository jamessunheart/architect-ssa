const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Chat console UI
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
              .then(data => {
                if (data.message) log("✅ " + data.message);
                else if (data.error) log("❌ " + data.error);
              })
              .catch(err => log("❌ " + err.message));
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ Evolve endpoint
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  const newCode = `\n// 🔁 SSA Evolution\n// ${instruction}\n`;

  try {
    // 1. Append to app.js
    fs.appendFileSync("app.js", newCode);

    // 2. Git commit + push with safe message
    const safeInstruction = instruction.replace(/"/g, '\\"');
    execSync("git add app.js");
    execSync(`git commit -m "🧠 SSA evolved: ${safeInstruction}"`);
    execSync("git push");

    res.json({ message: "SSA evolved and pushed to GitHub." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evolution failed: " + err.message });
  }
});

// ✅ Base
app.get("/", (req, res) => res.send("👋 SSA is running. Go to /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
