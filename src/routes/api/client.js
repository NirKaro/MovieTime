const uuid4 = require("uuid4");
const express = require("express");
const Router = express.Router();
const {
  CookieValidation,
  adminValidation,
} = require("../../middlewares/authentication");
const Clients = require("../../db/models/clients");
const JWT = require("jsonwebtoken");

// Get client information
Router.get("/", CookieValidation, async function (req, res) {
  try {
    const clients = await Clients.findOne({ userId: res.userId }).exec();
    if (Object.keys(clients).length > 0) {
      res.send(clients);
    } else {
      console.log("No clients found for GET request");
      res.send("No client/s were found");
    }
  } catch (err) {
    console.log(`[FAIL] Error fetching clients, ${err}`);
    res.sendStatus(500);
  }
});

// Get all clients information for admin page
Router.get(
  "/all",
  CookieValidation,
  adminValidation,
  async function (req, res) {
    try {
      const clients = await Clients.find({
        userId: { $nin: req.cookies.userId },
      }).exec();
      if (Object.keys(clients).length > 0) {
        res.send(clients);
      } else {
        console.log("No clients found for GET request");
        res.send("No client/s were found");
      }
    } catch (err) {
      console.log(`[FAIL] Error fetching clients, ${err}`);
      res.sendStatus(500);
    }
  }
);

// Delete client data
Router.post("/delete", CookieValidation, async function (req, res) {
  await Clients.findOneAndDelete({ userId: req.body.userId });
  console.log(
    `[SUCCESS] Successfully deleted client with ID: ${req.body.userId}`
  );
  res.redirect("/admin");
});

// Register new user
Router.post("/", async function (req, res) {
  try {
    const userId = uuid4();
    const username = req.body.username;
    const password = req.body.password;
    let payload = {
      username: username,
    };
    let token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
    const newClient = new Clients({
      userId: userId,
      username: username,
      password: password,
      sessionKey: token,
    });
    await newClient.save(function (err) {
      if (err) {
        console.log(
          `[FAIL] Error adding new client or client already exists: ${err}`
        );
        res.status(500).render("register.ejs", {
          errMsg: "Error adding new client or client already exists",
        });
      } else {
        console.log(`[SUCCESS] Created new web client, ${newClient.username}`);
        res.redirect("/login");
      }
    });
  } catch (e) {
    console.log(`[FAIL] Exception was thrown adding new user: ${e}`);
    res.sendStatus(403).render("register.ejs", {
      errMsg: "Something went wrong. please try again",
    });
  }
});

module.exports = Router;
