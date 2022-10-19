const router = require('express').Router()
const {CookieValidation, adminValidation, checkNotAuthenticated} = require("../../middlewares/authentication");

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
    res.render('index.ejs', { name: req.cookies.username, userId : req.cookies.userId})
})

router.get('/myOrders', CookieValidation, (req, res) => {
    res.render('myOrders.ejs', { name: req.cookies.username, userId : req.cookies.userId})
})

// Forbidden page
router.get("/fail", (req, res) => {
    res.status(403).json("Failed to authenticate")
});

module.exports = router