const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))
const botName = 'Chatcord BOT'


const PORT = 3000 || process.env.PORT

io.on('connection', (socket) => {

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin( socket.id, username, room)
        socket.join(user.room)

        // Welcome user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatPort'))


        // Broadcast when user connects 
        socket.broadcast.to(user.room).emit('message',  formatMessage(botName, `${user.username} joined the chat`))

        // Send users and room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room, 
            users: getRoomUsers(user.room)
        })
    })


    
    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',formatMessage(user.username, message))
    })
    
    // Runs when client disc 
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if(user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `${user.username} left the chat`)
            )
            // Send users and room info 
            io.to(user.room).emit('roomUsers', {
                room: user.room, 
                users: getRoomUsers(user.room)
            })
        }
    })
})


server.listen(PORT, () => {
    console.log('server running on port: ' + PORT)
})

