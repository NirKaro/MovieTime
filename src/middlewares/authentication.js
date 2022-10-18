const JWT = require("jsonwebtoken");
const Clients = require("../db/models/clients");

const CookieValidation = async (req, res, next) => {
  try {
    const token = req.cookies.authorization;
    if (token == null) return res.redirect("/login");
    JWT.verify(token, process.env.JWT_SECRET.toString(), {}, (err) => {
      if (err) {
        console.log(`[FAIL] Token failure ${err.message}`);
        return res.status(403).redirect("/login");
      }
      Clients.findOne(
        { sessionKey: req.cookies.authorization },
        function (err, user) {
          if (err) {
            console.log(`[FAIL] Client not found, ${err}`);
            res.status(401).redirect("/login");
          } else {
            if (user) {
              res.auth = true;
              res.userId = user.userId;
              next();
            } else {
              console.log(`[FAIL] No Client matched with the token: ${token}`);
              res
                .status(401)
                .clearCookie("authorization")
                .clearCookie("username")
                .clearCookie("userId")
                .render("login.ejs", { errMsg: "Token not valid or expired" });
            }
          }
        }
      );
    });
  } catch (err) {
    console.log(`[FAIL] Client authentication failure, ${err}`);
    res
      .sendStatus(401)
      .clearCookie("authorization")
      .clearCookie("username")
      .clearCookie("userId")
      .render("login.ejs", { errMsg: "Authentication failure" });
  }
};

// checks the user not logged in - to prevent navigate to login of user that is already logged in
function checkNotAuthenticated(req, res, next) {
  const token = req.cookies.authorization;
  if (token == null) {
    next();
  } else {
    res.redirect("/home");
  }
}

// validates the user is admin
const adminValidation = (req, res, next) => {
  if (req.cookies.username === "admin") {
    next();
  } else {
    res.redirect("/");
  }
};

const loginValidation = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    if ((username || email) && password) {
      const client = await Clients.findOne({
        $or: [
          { username: username, password: password },
          { email: email, password: password },
        ],
      }).exec();
      if (client !== null) {
        console.log(
          `[SUCCESS] Authenticating login credentials for client: ${
            username || email
          }`
        );
        next();
      } else {
        console.log("Client not found");
        res.status(401).render("login.ejs", { errMsg: "Client not found" });
      }
    } else {
      console.log(`[FAIL] Wrong login information provided`);
      res.sendStatus(401);
    }
  } catch (err) {
    console.log(`[FAIL] Error parsing login request ${err}`);
    res.sendStatus(400);
  }
};

module.exports = {
  CookieValidation,
  loginValidation,
  adminValidation,
  checkNotAuthenticated,
};
