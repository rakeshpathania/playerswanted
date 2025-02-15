
 import createError from 'http-errors'
 import express from "express";

// var io = require('socket.io')(http);
// var http = require( "http" ).createServer( app )
// var app = express();
// var http = require('http').Server(app);
// var io = require( "socket.io" )( http );
// io.on('connection',function(socket){
//   console.log("A user is connected");
// });
import path from 'path';
import cookieParser from 'cookie-parser';
import logger  from 'morgan';
import session from 'express-session';
import fileupload from 'express-fileupload';
import {indexRouter} from './routes/index.js';
import {usersRouter} from './routes/users.js';
import {webRouter} from './routes/web.js';
import {socketIo} from './socket.js'
import flash from 'express-flash';
import bodyParser from 'body-parser';
import { createServer } from "http";



import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


var app = express();
const http = createServer(app);


socketIo(http);

app.use(bodyParser.urlencoded({extended: true}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'XCR3rsasa%RDHHH',
  cookie: {
    maxAge: 900000000
  }
}));


app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));
app.use('/', webRouter);
app.use('/users', usersRouter);
// app.use('/api', apiRouter);
app.use('/admin',indexRouter)

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
// error handler
// var port = 7000
// var port = Number(process.env.PORT || 3164);
// http.listen(port,()=>{
//   console.log(`Example app listening on port ${port}`)
// })

http.listen(3164, function () {
  console.log('Node app is running on port 3164');
});


