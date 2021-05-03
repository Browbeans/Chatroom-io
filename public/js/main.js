const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Get user name and room from url 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

// join chatroom 
socket.emit('joinRoom', { username, room })

// GEt room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// Message from server
socket.on('message', (message) => {
    outputMessage(message)

    // Scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight
})

// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const message = e.target.elements.msg.value

    // Emitting message to server
    socket.emit('chatMessage', message)

    // Clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// Output message to dom
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta"> 
        ${message.username} 
            <span>
                ${message.time}
            </span>
    </p>
    <p class="text">
        ${message.text}
    </p>
    `
    document.querySelector('.chat-messages').appendChild(div)
}

function outputRoomName(room) {
    roomName.innerHTML = room
}

function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}