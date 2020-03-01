const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const mes = document.getElementsByClassName('user')

if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    console.log()
    e.preventDefault()
    const message = messageInput.value
    var kickword = message.split(" ")
    console.log(roomName, name)
    if(kickword[0] === "#kick"){
      console.log('to be kicked', kickword[1])
      socket.emit('kick', {
        room: roomName,
        user:  kickword[1]
      })
    }
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('confirm-vote', data => {
  console.log(data)
  $('.modal-body').html('Do you want to kick '+ data.user);
  var value = confirm('Do you want to kick '+ data.user);
  if(value === true){
    socket.emit('vote', data)
  }
})

socket.on('chat-message', data => {
  var text = data.message;
  var kickword = text.split(" ")[0]
  console.log(kickword)
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.classList.add("message");
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function vote(){

}