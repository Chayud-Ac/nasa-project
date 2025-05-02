// Server.js is handle the process of initialization of http server
require('dotenv').config();
const http = require('http');
const app = require('./app');
const { mongoConnect } = require('./services/mongo')
const { loadPlanetData } = require('./models/planets.model')
const { loadLaunchesData } = require('./models/launch.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    await loadPlanetData();
    await loadLaunchesData();
    server.listen(PORT , () => {
        console.log(`Server is listening to PORT:${PORT}`)
    })
}


startServer();