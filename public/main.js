const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const fileInput = document.getElementById('file');

//get username and room
const{username,room}= Qs.parse(location.search,{
  ignoreQueryPrefix: true
});



const socket = io();

//join chat
socket.emit('joinRoom', { username , room });

//get room info
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
  
})

socket.on('message', message =>{
  console.log(message);
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

//message submit

chatForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit('chatMessage',msg);

  //clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

document.getElementById('send-file').addEventListener('click', () => {
  fileInput.click();
});

// Handle file upload
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  const reader = new FileReader();

  // Define fileContent variable here
  let fileContent;

  reader.onload = (event) => {
    console.log("File loaded successfully");
    console.log(event.target.result); // Log the result
    fileContent = event.target.result; // Assign value to fileContent
    socket.emit('sendFile', { username, room, fileContent, filename: file.name });
    fileInput.value = '';
  };
  
console.log(fileContent);
  reader.readAsDataURL(file);
});
socket.on('fileMessage', fileMessage => {
  outputMessage(fileMessage);
});

// output message to dom

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  if (message.type === 'file') {
    const link = document.createElement('a');
    link.href = message.content; // Check if the content is already a data URL
    link.download = message.filename;
    link.textContent = message.filename;
    div.appendChild(link);
  } else {
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
  }
  document.querySelector('.chat-messages').appendChild(div);
}



//add room name to dom

function outputRoomName(room){
  roomName.innerText= room;

}

function outputUsers(users){
  userList.innerHTML=`${users.map(user => `<li>${user.username}</li>`).join('')}`;
}