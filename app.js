const express = require("express");
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
              .then(data => log("✅ " + data.message))
              .catch(err => log("❌ " + err.message));
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ Evolve endpoint — echoes back the instruction
app.post("/api/evolve", (req, res) => {
  const { instruction } = req.body;

  console.log("🧠 SSA received instruction:", instruction);
  res.json({ message: `SSA received: "${instruction}"` });
});

// ✅ Root route
app.get("/", (req, res) => res.send("👋 SSA is awake. Go to /console"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ SSA running on port ${port}`));
