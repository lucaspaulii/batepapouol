let nameObj
let nameInput
let previousMessages
let selectedUser = 'Todos';
let isPrivate = 'publicamente';

// save the input value as the users name, hide the login area and execute all functions that are necessary to access the website for the first time
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

// function that checks if the message is private or public, check the selected user and sends the message accordingly to the API
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

// function that reaches the API and GETs the messages data, then changes the html to display it, also checks if the last message pre update has the same time and sender that the recent
// loaded, if not it scrolls the page to the newest messages
function getMessages() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(handleSuccess);
    promise.catch(handleError);
    function handleSuccess(response) {
        const htmlChanger = document.querySelector('main');
        if (htmlChanger !== "") {
            previousLastMessage = htmlChanger.lastChild;
        }
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
            if(response.data[i].type === "private_message" && ((response.data[i].to === nameInput) || (response.data[i].from === nameInput))){
                htmlChanger.innerHTML = htmlChanger.innerHTML + `<div class="private-message">
                <p class="time">(${response.data[i].time})</p>
                <p class="text"><span class="name">${response.data[i].from}</span> reservadamente para <span class="name">${response.data[i].to}</span>: <span class="response">${response.data[i].text}</span></p>
                </div>`
            }

        }
        if (previousLastMessage) {
            previousTime = previousLastMessage.querySelector('.time');
            previousName = previousLastMessage.querySelector('.name');
        
            if (previousTime !== htmlChanger.lastChild.querySelector('.time') && previousName !== htmlChanger.lastChild.querySelector('.name')) {
                document.querySelector('.into-view').scrollIntoView();
            } 
        }            
    }

    function handleError(error) {
        alert(`something went wrong!`);
        document.location.reload(true);
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

// loops the getActiveUsers function every 10s
function activeUsersUpdate() {
    setInterval(getActiveUsers, 10000)
}


// function that reaches the API and get all the online users, then updates the sidebar html
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
        console.log(error);
        alert(`something went wrong!`);
        document.location.reload(true);
    }
}

// displays the sidebar when the people button is cicked
function displaySideBar() {
    document.querySelector('.sideBar').classList.remove('invisible');
    selectedUser = 'Todos';
}

// hide the sidebar when the darker area or the close button are clicked
function hideSideBar() {
    document.querySelector('.sideBar').classList.add('invisible');
    document.querySelector('.directMessage').innerHTML = `<p>Enviando para ${selectedUser} (${isPrivate})</p>`
}

// mark the selected user and save as a varuable for use in other functions
function selectUser(selected) {
    document.querySelector('.checkUser:not(.invisible)').classList.add('invisible');
    selected.querySelector('.checkUser').classList.remove('invisible');
    selectedUser = selected.querySelector('.sidebarText').innerHTML
}
// mark the selected message type (private or public) and saves as a variable for use in other functions
function selectPrivate(selected) {
    document.querySelector('.checkMessage:not(.invisible)').classList.add('invisible');
    selected.querySelector('.checkMessage').classList.remove('invisible');
    if (selected.querySelector('.sidebarText').innerHTML === "Reservadamente") {
        isPrivate = 'reservadamente';
    } else {
        isPrivate = 'publicamente';
    }
}

// refreshes the page when the logo button is clicked
function refreshPage() {
    document.location.reload(true);
}