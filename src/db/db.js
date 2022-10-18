const mongoose = require("mongoose");
const dbConnect = async () => {
    await mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
}
module.exports = {dbConnect}