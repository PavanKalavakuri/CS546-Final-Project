const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const exphbs = require('express-handlebars');

const configRoutes = require('./routes');

const app = express();

const http = require('http').Server(app);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var options = {
    debug: true
}
const io = require('socket.io')(http);
app.use('/peerjs', ExpressPeerServer);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use('/public', express.static(__dirname + "/public"));


app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views/'))


app.use(session({
    name: 'AuthCookie',
    secret: 'This is very very secrett..',
    resave: false,
    saveUninitialized: true
}));

io.on("connection" , (socket)=>{
    socket.on('createNewUsers' , (id , room)=>{
      socket.join(room);
      socket.to(room).emit('userJoinsRoom' , id);
      socket.on('disconnect' , ()=>{
          socket.to(room).emit('userDisconnects' , id);
      })
    })
  })


configRoutes(app);

http.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on PORT 3000..");
});