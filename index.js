const express = require("express");
const bodyparser = require("body-parser");
let ejs = require("ejs");
const app = express();
const path = require("path");
app.use(express.static("public"));
require("dotenv").config();
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const axios = require("axios");
const mongoose = require("mongoose");
mongoose.connect(`${process.env.mongourl}`, {
  useNewUrlParser: true,
});

// const mongoose = require("mongoose");

const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Ticker = mongoose.model("Ticker", tickerSchema);

app.get("/", (req, res) => {
  res.render("home");
});

async function Fetch() {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const tickers = Object.values(response.data).slice(0, 10); // Get the top 10 tickers
    console.log(tickers);
    await Ticker.deleteMany({});

    const tickerData = tickers.map((ticker) => ({
      name: ticker.name,
      last: parseFloat(ticker.last),
      buy: parseFloat(ticker.buy),
      sell: parseFloat(ticker.sell),
      volume: parseFloat(ticker.volume),
      base_unit: ticker.base_unit,
    }));

    await Ticker.insertMany(tickerData);
    return 1;
    // res.send("Data fetched and stored in the database successfully!");
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return 0;
  }
}

app.get("/get-data", async (req, res) => {
  await Fetch();
  try {
    const tickers = await Ticker.find();
    res.json(tickers);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("Error retrieving data.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
