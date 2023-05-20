const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route.js");
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());

app.use('/', route);

app.use((req, res) => {
  return res.status(404).send({ status: false, message: "Incorrect URL! Please enter valid URL" });
});

mongoose.connect("mongodb+srv://luckybigwings:738xp7MiKEIJWrz8@cluster0.kbmybtj.mongodb.net/testing", { useNewUrlParser: true })
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`App running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
  