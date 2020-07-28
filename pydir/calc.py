# -*- coding: utf-8 -*-

import sys
import json
import pickle

import tweepy

from janome.tokenizer import Tokenizer
tokenizer = Tokenizer()

ENV = json.load(open('env.json', 'r'))

auth = tweepy.OAuthHandler(
  ENV['TWITTER_API_KEY'],
  ENV['TWITTER_API_SECRET_KEY'])
auth.set_access_token(
  ENV['TWITTER_ACCESS_TOKEN'],
  ENV['TWITTER_ACCESS_TOKEN_SECRET'])
api = tweepy.API(auth, wait_on_rate_limit=True)

keyword = sys.stdin.readline()

# ******************** read dic
f = open("./pn.txt", "rb")
np_dic = pickle.load(f)
# print('dic OK.')
# print(np_dic["楽"])

total = {"p": 0, "n": 0, "e": 0}

for tweet in tweepy.Cursor(api.search, q=keyword).items(50):
  # print('tw OK.')
  res = {"p": 0, "n": 0, "e": 0}
  for t in tokenizer.tokenize(tweet.text):
    bf = t.base_form
    if bf in np_dic:
      r = np_dic[bf]
      if r in res:
        res[r] += 1
  if res["p"] - res["n"] > 0:
    total["p"] += 1
  elif res["p"] - res["n"] < 0:
    total["n"] += 1
  else:
    total["e"] += 1

conc = ""
if total["p"] > total["n"]:
  conc = "ポジティブなツイートが多いです。このトレンドを盛り上げていきましょう！"
elif total["p"] < total["n"]:
  conc = "ネガティブなツイートが多いです。発言内容によっては絡まれる危険があります。"

print(str(total["p"]) + "," + str(total["n"]) + "," + str(total["e"]) + ": " + conc)