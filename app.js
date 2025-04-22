const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SSA Console
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 300px; overflow-y: scroll; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <h1>🧠 SSA Console</h1>
        <div id="messages"></div>
        <input id="input" style="width: 80%" placeholder="Give SSA an instruction..." />
        <button onclick="send()">Send</button>

        <script>
          const log = msg => {
            document.getElementById("messages").innerHTML += "<div>" + msg + "</div>";
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

// 🧠 Evolve + Self-Rewriting Route
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;

  try {
    const match = instruction.match(/GET route at (\/\S+) that returns (.+)/);
    if (!match) throw new Error("Instruction format not recognized.");

    const route = match[1];
    const response = match[2];

    const routeCode = `
app.get("${route}", (req, res) => {
  res.json(${response});
});
`;

    // Append the route
    fs.appendFileSync("app.js", "\n// 🔁 " + instruction + "\n" + routeCode);

    // Git commit + push
    execSync("git add app.js");
    execSync(`git commit -m "🧠 SSA evolved: ${instruction}"`);
    execSync("git push");

    res.json({ message: `Evolved and pushed: ${route}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Default root route
app.get("/", (req, res) => res.send("👋 SSA is online. Go to /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
