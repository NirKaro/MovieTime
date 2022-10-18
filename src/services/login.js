const User = require("../models/clients");

async function login(username, password) {
    const user = await User.findOne({ _id: username, password });
    return user != null
}

async function register(username, password) {

    const user = new User({
        _id: username,
        password
    });

    await user.save()        
}

module.exports = { login, register }