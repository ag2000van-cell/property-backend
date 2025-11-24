const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Файл для хранения заявок
const FILE = "submissions.json";

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

  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Backend running on " + PORT);
});
