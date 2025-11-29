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
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: text
    });
    
    console.log("[TELEGRAM] Sending message to chat_id:", CHAT_ID);
    console.log("[TELEGRAM] Token (first 10 chars):", BOT_TOKEN.substring(0, 10));
    
    const options = {
      hostname: "api.telegram.org",
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = "";
      
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      
      res.on("end", () => {
        console.log("[TELEGRAM] Response Status:", res.statusCode);
        console.log("[TELEGRAM] Response Body:", responseData);
        
        if (res.statusCode === 200) {
          console.log("[TELEGRAM] Message sent successfully!");
          resolve(true);
        } else {
          console.error("[TELEGRAM] Error sending message. Status:", res.statusCode);
          reject(new Error(`Telegram API error: ${res.statusCode}`));
        }
      });
    });
    
    req.on("error", (error) => {
      console.error("[TELEGRAM] Request error:", error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

app.post("/submit", async (req, res) => {
  try {
    console.log("[SUBMIT] Received request:", req.body);
    
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
    console.log("[SUBMIT] Saved to file, total submissions:", old.length);
    
    // Send message to Telegram
    const message = `Новая заявка:\nИмя: ${data.name}\nТелефон: ${data.phone}\nEmail: ${data.email}\nЗапрос: ${data.request}`;
    
    console.log("[SUBMIT] Attempting to send Telegram message...");
    await sendTelegramMessage(message);
    
    res.json({ status: "ok", message: "Submission received and Telegram message sent" });
  } catch (error) {
    console.error("[SUBMIT] Error in POST /submit:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
  console.log("BOT_TOKEN set:", !!BOT_TOKEN);
  console.log("CHAT_ID set:", !!CHAT_ID);
});
