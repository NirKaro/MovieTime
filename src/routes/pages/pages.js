const router = require('express').Router()
const {CookieValidation,loginValidation, adminValidation, checkNotAuthenticated} = require("../../middlewares/authentication");

function ensureAuthenticated(req, res, next) {
    console.log("ensure",req.body, req.isAuthenticated())
    if (req.isAuthenticated())
        return next()
    else
        res.redirect('/login')
}

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render(`login.ejs`,{errMsg : ""});
})

router.get("/register", checkNotAuthenticated, (req, res) => {
    res.render(`register.ejs`, {errMsg: ""});
})

router.get("/chat", CookieValidation, (req, res) => {
    res.render(`others.ejs`, { name: req.cookies.username, userId : req.cookies.userId});
})
router.get(['/admin'], CookieValidation, adminValidation, (req, res) => {
    res.render(`admin.ejs`, { name: req.cookies.username, userId : req.cookies.userId});
})

router.get(['/', '/home'], CookieValidation, (req, res) => {
    // console.log("get/", JSON.stringify(req.cookies.username))
    res.render('index.ejs', { name: req.cookies.username, userId : req.cookies.userId})
})

router.get('/myOrders', CookieValidation, (req, res) => {
    // console.log("get/", JSON.stringify(req.cookies.username))
    res.render('myOrders.ejs', { name: req.cookies.username, userId : req.cookies.userId})
})

  
  


// Home page
// router.get("/home", CookieValidation, (req, res) => {
//     res.send(`Welcome to the WikiHotel page, ${req.user.displayName}`);
// })

// Forbidden page
router.get("/fail", (req, res) => {
    res.status(403).json("Failed to authenticate")
});



module.exports = router