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

  let isWaitingPush = true;

  if (keyword.length < 4) {
    message = "検索キーワードは4文字以上で入力してください";
    isWaitingPush = false;
  } else {
    message = "【" + keyword + " 】の極性を判定します";
  }

  let userId = event.source.userId;

  const echo = { type: "text", text: message };
  client
    .replyMessage(event.replyToken, echo)
    .then(() => {
      console.log("echo OK.");
    })
    .catch((err) => {
      console.log(err);
    });

  if (isWaitingPush) {
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
    const pyshell = new PythonShell("./pydir/calc.py");
    pyshell.send(keyword);
    pyshell.on("message", (message) => {
      resolve(message);
    });
  });
};
