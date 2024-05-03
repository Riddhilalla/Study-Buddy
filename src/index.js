const express = require("express");
const path = require("path");
const app = express();

const hbs = require("hbs");
const LogInCollection = require("./mongo");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, '../templates');
const publicPath = path.join(__dirname, '../public');

app.set('view engine', 'hbs');
app.set('views', tempelatePath);
app.use(express.static(publicPath));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/room', (req, res) => {
    res.render('room');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/landing', (req, res) => {
    res.render('landing');
});
app.get('/timer', (req, res) => {
    res.render('timer');
});


app.get('/lobby', (req, res) => {
    res.render('lobby');
});

app.get('/notes', (req, res) => {
    res.render('notes');
});
app.get('/room', (req, res) => {
    res.render('room');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/chat', (req, res) => {
    res.render('chat');
});
app.get('/index', (req, res) => {
    res.render('index');
});





app.get('/home', async (req, res) => {
    try {
        // Retrieve the username from the session or wherever it's stored
        const username = req.session.username; // This line assumes you're using express-session for session management

        // Find the user based on the retrieved username
        const user = await LogInCollection.findOne({ name: username });

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render('home', { naming: user.name, notes: user.notes });
    } catch (error) {
        console.error('Error rendering home template:', error);
        res.status(500).send("Internal Server Error");
    }
});




app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password,
        notes: [] 
    };

    await LogInCollection.insertMany([data]);
    res.status(201).render("home", { naming: `${req.body.name}`, notes: [] }); 
});

app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });

        if (check.password === req.body.password) {
            res.status(201).render("home", { naming: `${req.body.name}`, notes: check.notes });
        } else {
            res.send("Incorrect password");
        }
    } catch (e) {
        res.send("Wrong details");
    }
});

app.post('/notes/:name', async (req, res) => {
    console.log(req.params.name)

    try {
      const user = await LogInCollection.findOne({ name: req.params.name });
      if (!user) {
        return res.status(404).send("User not found");
      }
      const newNote = {
        title: req.body.title,
        content: req.body.content
      };
      user.notes.push(newNote);
      await user.save();
      res.status(201).redirect('/home'); 
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).send("Internal Server Error");
    }
  });




app.listen(3000, () => {
    console.log('Port connected');
});

const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('../public/messages.js');
const {userJoin , getCurrentUser,getRoomUsers,userLeaves} = require('../public/users.js');


const server = http.createServer(app);
const io = socketio(server);

//set static
app.use(express.static(path.join(__dirname,'public')));

const botName = 'Study Buddy';

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id, username,room);
        socket.join(user.room);

        socket.to(user.room).emit('message',formatMessage(botName,'Welcome to ChatRoom'));
    
        //broadcast
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        //send user in room

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('sendFile', ({ username, room, fileContent, filename }) => {
        const fileMessage = { type: 'file', username, filename, content: fileContent };
        io.to(room).emit('fileMessage', fileMessage);
      });
    //chatMessage

    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    //disconnects
    socket.on('disconnect',()=>{
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

        
    });
});


