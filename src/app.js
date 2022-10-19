const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const { dbConnect } = require("./db/db");
const cookieParser = require('cookie-parser');
const WebSocket = require('ws')
const https = require("https")
const fs = require("fs")
const passport = require("passport")
const uuid4 = require("uuid4")
const session = require('express-session')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));
app.set('view-engine', 'ejs')

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
const apiRouter = require("./routes/api/api")
const pagesRouter = require("./routes/pages/pages") // to implement...


// Main pages router
app.use('/', pagesRouter) // to implement...


// main API routes
app.use('/api', apiRouter)


// Web socket server
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT });
const clients = new Map()

httpsServer = https.createServer({
    key: fs.readFileSync('./certs/privateKey.key'),
    cert: fs.readFileSync('./certs/csr.cert'),
}, app);

dbConnect().then(() => {
    console.log("[SUCCESS] Successfully connected to MongoDB Cloud")
    httpsServer.listen(process.env.SERVER_PORT, async() => {
        console.log(`[SUCCESS] Started HTTPS server at https://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`)
        console.log(`[SUCCESS] Started WEB SOCKET server ${process.env.SERVER_HOST}:${process.env.WEBSOCKET_PORT}`)
        wss.on('connection', (ws) => {
            const clientId = uuid4()
            clients.set(clientId, ws)
            console.log(`[SUCCESS] New client connected to web socket, ID: ${clientId}`)

            ws.on('message', function incoming(message) {
                
                // broadcasting message to all users connected
                wss.clients.forEach(function each(client) {
                  if (client !== wss && client.readyState === WebSocket.OPEN) {
                    client.send(message + "");
                  }
                });
              });
        })

        
    })
}).catch((err) => {
    console.log("[FAIL] Failed to connect to data base", err)
    throw new Error(`[FAIL] Failed to connect to database, ${err}`)
})





