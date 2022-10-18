const express = require("express");
const Router = express.Router();
const JWT = require("jsonwebtoken");
const Clients = require("../../db/models/clients");
const clientsRouter = require("./client");
const OrdersRouter = require("./orders");
const MoviesRouter = require("./movies");
const notificationsRouter = require("./notifications");
const {
  CookieValidation,
  loginValidation,
} = require("../../middlewares/authentication");

// Home route
Router.post("/login", loginValidation, async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    let payload = {
      username: username,
    };
    let token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
    const ClientUpdated = await Clients.findOneAndUpdate(
      {
        $or: [{ username: username, password: password }],
      },
      { sessionKey: token },
      {}
    );

    console.log(`[SUCCESS] Authenticated client: ${username || email}`);
    res
      .cookie("authorization", token)
      .cookie("username", username)
      .cookie("userId", ClientUpdated.userId);
    res.redirect("/home");
  } catch (err) {
    console.log(`Error updating user session key: ${err}`);
    res.sendStatus(500);
  }
});

// About route
Router.get("/logout", async function (req, res) {
  await Clients.findOneAndUpdate(
    { userId: req.cookies.userId },
    { sessionKey: "" },
    {}
  );
  console.log(`Signed user out, userID:  ${req.cookies.userId}`);
  res
    .clearCookie("authorization")
    .clearCookie("username")
    .clearCookie("userId")
    .render("login.ejs", { errMsg: "" });
});

Router.use("/user", clientsRouter);

Router.use("/orders", OrdersRouter);

Router.use("/movies", MoviesRouter);

Router.use("/notifications", notificationsRouter);

module.exports = Router;
