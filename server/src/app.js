// This file is responsible for setting up and exporting your Express application
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path')
const api = require('./routes/api')


const app = express();
app.use(cors({
    origin: 'http://localhost:3000'
}));
// morgan is the middleware that use to log the incoming request
// combined is the standard apache log output 
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname , '..' , 'public')))
app.use('/v1' , api)


app.get('/*path' , (req ,res) => {
    res.sendFile(path.join(__dirname , '../' , 'public' , 'index.html'))
})

module.exports = app  
