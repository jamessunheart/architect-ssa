const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Console Chat Interface
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 700px; margin: auto; }
          h1 { font-size: 2rem; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 300px; overflow-y: scroll; margin-bottom: 1rem; background: #f9f9f9; }
          input { width: 80%; padding: 0.5rem; font-size: 1rem; }
          button { padding: 0.5rem 1rem; font-size: 1rem; }
        </style>
      </head>
      <body>
        <h1>🧠 SSA Console</h1>
        <div id="messages"></div>
        <input id="input" placeholder="Give SSA an instruction..." />
        <button onclick="send()">Send</button>

        <script>
          const log = (msg, emoji = '✅') => {
            document.getElementById("messages").innerHTML += "<div>" + emoji + " " + msg + "</div>";
          };
          const send = () => {
            const instruction = document.getElementById("input").value;
            log(instruction, "🧠");
            fetch("/api/evolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ instruction })
            })
              .then(res => res.json())
              .then(data => {
                if (data.message) log(data.message);
                else if (data.error) log(data.error, "❌");
              })
              .catch(err => log(err.message, "❌"));
          };
        </script>
      </body>
    </html>
  `);
});

// ✅ Evolve Endpoint
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  const snippet = `\n// 🔁 SSA Evolution\n// ${instruction}\n`;

  try {
    fs.appendFileSync("app.js", snippet);

    execSync("git add app.js");
    execSync(`git commit -m "🧠 SSA evolved: ${instruction}"`);
    execSync("git push");

    res.json({ message: "SSA evolved and pushed to GitHub." });
  } catch (err) {
    console.error("Evolution error:", err.message);
    res.status(500).json({ error: `Evolution failed: ${err.message}` });
  }
});

// ✅ Root
app.get("/", (req, res) => res.send("👋 SSA is awake. Visit /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
