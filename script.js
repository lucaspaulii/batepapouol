let nameObj
let nameInput
let previousMessages
let selectedUser = 'Todos';
let isPrivate = 'publicamente';

function enterWebsite() {
    nameInput = document.querySelector('.loginInput input').value;
    document.querySelector('.loginMenu').classList.add('invisible');
    getName();
    getMessages();
    getActiveUsers();
    statusUpdate();
    activeUsersUpdate();
}


// function asks user's name and sends the information to the API
function getName() {
    //nameInput = prompt(`whats your name?`);
    nameObj = {name: nameInput};

    //Posting the name on the API and calling promise success and error functions
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nameObj);
    promise.then(handleSuccess);
    promise.catch(handleError);

    function handleSuccess(response) {
        getMessages();
    }

    function handleError(error) {
        if (error.status === 400) {
            nameInput = prompt(`Name already in use! Try another one`);
            nameObj = {name: nameInput};
            promise.then(handleSuccess);
            promise.catch(handleError);
        }
    }
    
}


function sendMessage() {
    const message = document.querySelector('footer input').value;
    let messageType
    if (isPrivate === 'reservadamente') {
        messageType = 'private_message'
    } else {
        messageType = 'message'
    }
    const messageObject = {
        from: `${nameInput}`,
        to: `${selectedUser}`,
        text: `${message}`,
        type: `${messageType}`
    }
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', messageObject);
    promise.then(handleSuccess);
    promise.catch(handleError);
    function handleSuccess(response) {       
        getMessages()
        document.querySelector('footer input').value = '';
    }
    function handleError(error) {
        alert(`Faied to send the message`);
        window.location.reload();
    }
}

// function that reaches the API and GETs the messages data, then changes the html to display it


function getMessages() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(handleSuccess);
    promise.catch(handleError);
    function handleSuccess(response) {
        const htmlChanger = document.querySelector('main');
        previousLastMessage = htmlChanger.lastChild;
        htmlChanger.innerHTML = '';
        for (let i=0; i<response.data.length; i++){            
            if(response.data[i].type === "status"){
                htmlChanger.innerHTML = htmlChanger.innerHTML + `<div class="user-activity">
                <p class="time">(${response.data[i].time})</p>
                <p class="text"><span class="name">${response.data[i].from}</span> ${response.data[i].text}</p>
                </div>`
            }
            if(response.data[i].type === "message"){
                htmlChanger.innerHTML = htmlChanger.innerHTML + `<div class="message">
                <p class="time">(${response.data[i].time})</p>
                <p class="text"><span class="name">${response.data[i].from}</span> para <span class="name">${response.data[i].to}</span>: <span class="response">${response.data[i].text}</span></p>
                </div>`
            }
            if(response.data[i].type === "private_message" && response.data[i].to === nameInput){
                htmlChanger.innerHTML = htmlChanger.innerHTML + `<div class="private-message">
                <p class="time">(${response.data[i].time})</p>
                <p class="text"><span class="name">${response.data[i].from}</span> reservadamente para <span class="name">${response.data[i].to}</span>: <span class="response">${response.data[i].text}</span></p>
                </div>`
            }

        }
        previousTime = previousLastMessage.querySelector('.time');
        previousName = previousLastMessage.querySelector('.name');
        if (previousTime !== htmlChanger.lastChild.querySelector('.time') && previousName !== htmlChanger.lastChild.querySelector('.name')) {
            document.querySelector('.into-view').scrollIntoView();
        }        
    }

    function handleError(error) {
        alert(`something went wrong!`)
    }
}


// function that updates the user status and if it succeeds calls the getMessages function to update the messages
function statusUpdate() {
    setInterval(function() {
        const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', nameObj);
        promise.then(handleSuccess);
        promise.catch(handleError);

        function handleSuccess(response) {       
        getMessages();
    }

        function handleError(error) {
        alert(`You are no longer active, please refresh the page and log-in again`)
        document.location.reload(true);
    }
    }, 5000)
}
function activeUsersUpdate() {
    setInterval(getActiveUsers, 10000)
}

function getActiveUsers() {
    const onlineUsers = document.querySelector('#onlineUsers');
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(handleSuccess);
    promise.catch(handleError);   
    function handleSuccess(response) {
        document.querySelector('.directMessage').innerHTML = `<p>Enviando para ${selectedUser} (${isPrivate})</p>`
        onlineUsers.innerHTML = `<li>
    <div class="contact" onclick="selectUser(this)">
        <div class="supportDiv">
            <ion-icon name="people-sharp"></ion-icon>
            <p class="sidebarText">Todos</p>
        </div>
        <ion-icon name="checkmark-sharp" class="checkUser"></ion-icon>
    </div>
</li>`
        for (let i=0; i<response.data.length; i++) {
            onlineUsers.innerHTML += `<li>
            <div class="contact" onclick="selectUser(this)">
                <div class="supportDiv">
                    <ion-icon name="person-circle-sharp"></ion-icon>
                    <p class="sidebarText">${response.data[i].name}</p>
                </div>
                <ion-icon name="checkmark-sharp" class="checkUser invisible"></ion-icon>
            </div>
        </li>`
        }
    }
    function handleError(error) {
        console.log(error)
        alert(`something went wrong!`)
    }
}

function displaySideBar() {
    document.querySelector('.sideBar').classList.remove('invisible');
    selectedUser = 'Todos';
}

function hideSideBar() {
    document.querySelector('.sideBar').classList.add('invisible');
    document.querySelector('.directMessage').innerHTML = `<p>Enviando para ${selectedUser} (${isPrivate})</p>`
}


function selectUser(selected) {
    document.querySelector('.checkUser:not(.invisible)').classList.add('invisible');
    selected.querySelector('.checkUser').classList.remove('invisible');
    selectedUser = selected.querySelector('.sidebarText').innerHTML
}

function selectPrivate(selected) {
    document.querySelector('.checkMessage:not(.invisible)').classList.add('invisible');
    selected.querySelector('.checkMessage').classList.remove('invisible');
    if (selected.querySelector('.sidebarText').innerHTML === "Reservadamente") {
        isPrivate = 'reservadamente';
    } else {
        isPrivate = 'publicamente';
    }
}
function refreshPage() {
    document.location.reload(true);
}