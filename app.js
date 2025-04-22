const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SSA Console UI
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
                if (data.message) {
                  log("✅ " + data.message);
                } else if (data.error) {
                  log("❌ " + data.error);
                } else {
                  log("⚠️ Unexpected response");
                }
              })
              .catch(err => log("❌ " + err.message));
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ Evolution Route
app.post("/api/evolve", async (req, res) => {
  const { instruction } = req.body;
  const newCode = `\n// 🔁 SSA Evolution\n// ${instruction}\n`;

  try {
    // Set Git identity (so Render doesn’t complain)
    execSync(`git config user.email "ssa@cora.ai"`);
    execSync(`git config user.name "SSA Engine"`);

    // Write the new instruction to the file
    fs.appendFileSync("app.js", newCode);

    // Git add, commit, and push
    execSync("git add app.js");
    execSync(`git commit -m "🧠 SSA evolved: ${instruction}"`);
    execSync("git push");

    res.json({ message: "SSA evolved and pushed to GitHub." });
  } catch (err) {
    console.error("❌ Evolution failed:", err.message);
    res.status(500).json({ error: `Evolution failed: ${err.message}` });
  }
});

// ✅ Example SSA Action Route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from SSA 👋" });
});

// ✅ Default Base
app.get("/", (req, res) => {
  res.send("👋 SSA is running. Visit /console");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
