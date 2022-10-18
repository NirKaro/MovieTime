const router = require('express').Router()
const passport = require("passport")
const strategy = require("passport-facebook")
const FacebookStrategy = strategy.Strategy;
const utils = require('../../utils')
const jwt = require('jsonwebtoken')
const Users = require("../../database/models/users")

passport.serializeUser(function(user, done) {
    done(null, user);
});


passport.deserializeUser(function(obj, done) {
    done(null, obj);
})

passport.use(
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ['id', 'displayName', 'photos', 'email', 'name']
        },
        async function(accessToken, refreshToken, profile, done) {
            const displayName = profile.displayName
            const { email, first_name, last_name, username } = profile._json;
            const userData = {
                email: email,
                displayName: displayName,
                firstName: first_name,
                lastName: last_name,
            }
            console.log("[+] Facebook authentication:", userData)
            done(null, profile)
        }
    )
);

router.get("/", passport.authenticate("facebook", { scope: ['email'] }));


router.get("/callback", passport.authenticate("facebook", {
    scope: ['email'],
    failureRedirect: "/fail"
}), async function(req, res) {
    req.user = req.user._json
    const payload = {
        username: req.user.email,
    }
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
    const user = await Users.findOne({ email: req.user.email }).select('-_id -updatedAt').exec()
    if (user === null) {
        // Add new user by his facebook email
        await utils.addNewUser(req.user.email, `${req.user.first_name}_${req.user.last_name}`, "default", token)
    } else {
        // Search by user email
        const user = await Users.findOneAndUpdate({ email: req.user.email }, { sessionKey: token }, {})
        console.log(`[+] Updated new session key for user, ${ user.userId }`)
    }
    console.log(`[+] Successfully initialized user: ${ req.user.name }`)
    res.cookie('authorization', token)
    res.redirect('/home')
})

module.exports = router