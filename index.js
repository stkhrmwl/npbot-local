"use strict";

const line = require("@line/bot-sdk");
const express = require("express");

const ENV = require("./env.json");

const { PythonShell } = require("python-shell");

const config = {
  channelAccessToken: ENV.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: ENV.LINE_CHANNEL_SECRET,
};
const client = new line.Client(config);

const app = express();

function handleEvent(event) {
  let message = "message initialized";
  let keyword = "Twitter";

  if (event.type === "message" && event.message.type === "text") {
    keyword = event.message.text;
  }

  let userId = event.source.userId;

  /*
  getAnalyzed(keyword).then((result) => {
    message = result;
    const echo = { type: "text", text: message };

    return client.replyMessage(event.replyToken, echo);
  });
  */

  const echo = { type: "text", text: message };
  client
    .replyMessage(event.replyToken, echo)
    .then(() => {
      console.log("echo OK.");
    })
    .catch((err) => {
      console.log(err);
    });

  getAnalyzed(keyword).then((result) => {
    const pushContent = {
      type: "text",
      text: result,
    };
    client
      .pushMessage(userId, pushContent)
      .then(() => {
        console.log("push OK.");
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

const getAnalyzed = (keyword) => {
  return new Promise((resolve) => {
    const pyshell = new PythonShell("./calc.py");
    let enc = escape(keyword).replace(/%/g, "\\");
    pyshell.send(enc);
    pyshell.on("message", (message) => {
      resolve(message);
    });
  });
};
