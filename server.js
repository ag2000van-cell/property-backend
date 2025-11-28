const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");

const BOT_TOKEN = "7362366319:AAF2CzrzXNz4NMijXVhKwkKs3eBRzstCKWw";
const CHAT_ID = "5039383557";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// File for storing submissions
const FILE = "submissions.json";

function sendTelegramMessage(text) {
  const data = JSON.stringify({
    chat_id: CHAT_ID,
    text: text
  });

  const options = {
    hostname: "api.telegram.org",
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  const req = https.request(options, res => {
    // Ignore response
  });
  req.on("error", error => {
    console.error(error);
  });
  req.write(data);
  req.end();
}

app.post("/submit", (req, res) => {
  const data = req.body;

  let old = [];
  if (fs.existsSync(FILE)) {
    old = JSON.parse(fs.readFileSync(FILE, "utf8"));
  }

  old.push({
    ...data,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(FILE, JSON.stringify(old, null, 2), "utf8");

  // Send message to Telegram
  const message = `\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u044f\u0432\u043a\u0430:\n\u0418\u043c\u044f: ${data.name}\n\u0422\u0435\u043b\u0435\u0444\u043e\u043d: ${data.phone}\nEmail: ${data.email}\n\u0417\u0430\u043f\u0440\u043e\u0441: ${data.request}`;
  sendTelegramMessage(message);

  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
