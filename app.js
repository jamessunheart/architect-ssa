const express = require("express");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("👋 SSA is running. Go to <a href='/console'>/console</a>");
});

// ✅ SSA Console UI
app.get("/console", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSA Console</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto; }
          #messages { border: 1px solid #ccc; padding: 1rem; height: 200px; overflow-y: scroll; margin-bottom: 1rem; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>🧠 SSA Console</h1>
        <div id="messages"></div>
        <input id="input" placeholder="Type an instruction..." style="width: 80%" />
        <button onclick="send()">Send</button>

        <script>
          const log = msg => {
            const div = document.createElement('div');
            div.innerText = msg;
            document.getElementById('messages').appendChild(div);
          };

          async function send() {
            const input = document.getElementById("input").value;
            log("🧠 " + input);
            try {
              const res = await fetch("/api/evolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instruction: input })
              });
              const data = await res.json();
              if (res.ok) log("✅ " + data.message);
              else log("❌ " + data.error);
            } catch (err) {
              log("❌ Network error: " + err.message);
            }
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ SSA Evolution endpoint
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;
  const patch = `\n// 🔁 SSA Evolution\n// ${instruction}\n`;
  const filePath = path.join(__dirname, "app.js");

  try {
    // 🔍 Step 1: Simulate applying the patch
    const original = fs.readFileSync(filePath, "utf-8");
    const simulated = original + patch;

    // ✅ Step 2: Basic syntax check
    try {
      new Function(simulated); // validate
    } catch (err) {
      return res.status(400).json({ error: "Invalid JavaScript: " + err.message });
    }

    // 💾 Step 3: Write, commit and push
    fs.writeFileSync(filePath, simulated);
    execSync("git add app.js");
    execSync(`git commit -m \"🧠 SSA evolved: ${instruction}\"`);
    execSync("git push");

    res.json({ message: "SSA evolved, committed and pushed successfully." });
  } catch (err) {
    console.error("❌ Evolution failed:", err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
