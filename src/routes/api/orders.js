const express = require("express");
const Router = express.Router();
const { CookieValidation } = require("../../middlewares/authentication");
const uuid4 = require("uuid4");
const Orders = require("../../db/models/orders");

// Add new order
Router.post("/", CookieValidation, async function (req, res) {
  try {
    const newOrder = new Orders({
      userId: req.body.userId,
      movieId: req.body.movieId,
      orderId: uuid4(),
    });
    await newOrder.save();
    console.log(
      `[SUCCESS] Added new order to database, ID: ${newOrder.orderId}`
    );
    res.redirect("/myOrders");
  } catch (err) {
    console.log(`[FAIL] Error adding new order, ${err}`);
    res.status(400).redirect("/myOrders");
  }
});

Router.get("/counts", CookieValidation, async function (req, res) {
  try {
    const groupedOrders = await Orders.aggregate([
      { $match: {} },
      { $group: { _id: "$movieId", total: { $count: {} } } },
    ]).exec();
    res.json(groupedOrders);
    console.log(
      `[SUCCESS] Fetched ${
        Object.keys(groupedOrders).length
      } orders, for user ID: ${res.userId}`
    );
  } catch (err) {
    console.log(`Error fetching current orders in DB, ${err}`);
    res.json("Error fetching current orders in DB").status(500);
  }
});

// Getting all orders for client
Router.get("/", CookieValidation, async function (req, res) {
  try {
    const orders = await Orders.find({ userId: req.cookies.userId })
      .select("-_id -updatedAt")
      .exec();
    res.json(orders);
    console.log(
      `[SUCCESS] Fetched ${Object.keys(orders).length} orders, for user ID: ${
        res.userId
      }`
    );
  } catch (err) {
    console.log(`Error fetching current orders in DB, ${err}`);
    res.json("Error fetching current orders in DB").status(500);
  }
});

// Update order info
Router.put("/", CookieValidation, async function (req, res) {
  try {
    const orderId = req.body.orderId;
    let order = await Orders.findOne({
      orderId: orderId,
      userId: res.userId,
    }).exec();
    order.movieId = (req.body.movieId && req.body.movieId) || order.movieId;
    order.userId = (req.body.userId && req.body.userId) || order.userId;
    await order.save();
    console.log(
      `[SUCCESS] Successfully changed order ID ${orderId} information`
    );
    res.send();
  } catch (err) {
    console.log(`[FAIL] Failed to change order information, ${err}`);
    res
      .json("No order was found or incorrect order format was entered")
      .status(400);
  }
});

module.exports = Router;
