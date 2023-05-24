const express = require("express");
const cors = require("cors");
const tf = require("@tensorflow/tfjs");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/:text", (request, response) => {
  const textSentiment = request.params.text;

  console.log(textSentiment.body);

  const typesOfSentiment = {
    Positive: 0.66,

    Neutral: 0.33,

    Negative: 0,
  };

  const PAD_INDEX = 0;

  const OOV_INDEX = 2;

  const urls = {
    urlModels:
      "https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json",

    urlOfData:
      "https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json",
  };

  let data, model;

  async function ModelSentiment() {
    if (typeof model === "undefined") {
      model = await ModelFunc(urls.urlModels);
    }
    if (typeof data === "undefined") {
      data = await DataLoader(urls.urlOfData);
    }
  }

  async function ModelFunc(url) {
    try {
      const model = await tf.loadLayersModel(url);

      return model;
    } catch (err) {
      console.log(err);
    }
  }

  async function DataLoader(url) {
    try {
      const metadataJson = await fetch(url);

      const data = await metadataJson.json();

      return data;
    } catch (err) {
      console.log(err);
    }
  }

  function processor(texts) {
    ModelSentiment().then((result) => {
      const sentiment_score = getSentimentScore(texts);
      let text_sentiment = "";
      if (sentiment_score > typesOfSentiment.Positive) {
        text_sentiment = "positive";
      } else if (sentiment_score > typesOfSentiment.Neutral) {
        text_sentiment = "neutral";
      } else if (sentiment_score >= typesOfSentiment.Negative) {
        text_sentiment = "negative";
      }
      let textData = {
        sentiment: text_sentiment,
        score: sentiment_score.toFixed(4),
        text: texts,
      };

      response.json(textData);
    });
  }

  function padSequences(
    sequences,
    maxLen,
    padding = "pre",
    truncating = "pre",
    value = PAD_INDEX
  ) {
    return sequences.map((seq) => {
      if (seq.length > maxLen) {
        if (truncating === "pre") {
          seq.splice(0, seq.length - maxLen);
        } else {
          seq.splice(maxLen, seq.length - maxLen);
        }
      }

      if (seq.length < maxLen) {
        const pad = [];
        for (let i = 0; i < maxLen - seq.length; ++i) {
          pad.push(value);
        }
        if (padding === "pre") {
          seq = pad.concat(seq);
        } else {
          seq = seq.concat(pad);
        }
      }

      return seq;
    });
  }

  function getSentimentScore(text) {
    console.log(text);
    const inputText = text
      .trim()
      .toLowerCase()
      .replace(/(\.|\,|\!)/g, "")
      .split(" ");
    const sequence = inputText.map((word) => {
      let wordIndex = data.word_index[word] + data.index_from;
      if (wordIndex > data.vocabulary_size) {
        wordIndex = OOV_INDEX;
      }
      return wordIndex;
    });
    const padSequense = padSequences([sequence], data.max_len);
    const input = tf.tensor2d(padSequense, [1, data.max_len]);

    const prediction = model.predict(input);
    const score = prediction.dataSync()[0];
    prediction.dispose();

    return score;
  }

  processor(textSentiment);
});

app.listen(5000, () => {
  console.log("Server Started");
});
