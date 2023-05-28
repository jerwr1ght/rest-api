const usersFileName = 'users.json';
const sessionsFileName = 'sessions.json';
const bodyParser = require('body-parser');
const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const cors=require("cors");
const corsOptions = {
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const fs = require('fs'); // file stream

function getJsonItems(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
}

function generateToken() {
    return uuidv4();
}

function updateSessions(sessions) {
    fs.writeFileSync(sessionsFileName, JSON.stringify(sessions));
}

function updateUsers(users) {
    fs.writeFileSync(usersFileName, JSON.stringify(users));
}

function createSession(username) {
    var sessions = getJsonItems(sessionsFileName);

    var newToken = generateToken();

    var newSession = 
    {
        "username" : username,
        "sessionId" : newToken,
        "isOpen" : true,
    }

    sessions.push(newSession);

    updateSessions(sessions);

    return newSession;
}

function getTextByPage(requestData, page, wordsCount) {
    
    const text = requestData.responseText;

    if (text.length == 0) {
        requestData.isLast = false;
        return requestData;
    }
    
    const lower = (Math.abs(page) - 1) * wordsCount;
    
    const splittedText = text.split(" ");

    const substrText = splittedText.slice(lower, lower + wordsCount).join(' '); 

    if (lower + wordsCount >= splittedText.length) {
        requestData.isLast = true;
    } else {
        requestData.isLast = false;
    }

    requestData.responseText = substrText;


    return requestData;
}

app.get('/', (request, response) => {
    response.json({'response': 'ok'});
});

app.post('/login', (request, response) => {
    var users = getJsonItems(usersFileName);


    let user = users.find(u => u.username === request.body.username);
    let password = users.find(u => u.password === request.body.password);


    var responseMessage; 
    if (!user || !password) {   
        responseMessage = {'response': 'User login is failed'};
        response.statusCode = 400;
    }
    else {
        responseMessage = {'sessionId': createSession(user.username).sessionId};
        response.statusCode = 200;
    }

    response.json(responseMessage);
    
});

app.delete('/logout', (request, response) => {
    var sessions = getJsonItems(sessionsFileName);
    var foundSession = {'response':"Session is closed or couldn't be found"};
    response.statusCode = 400;

    for (var i in sessions) {
        var isSessionEqual = sessions[i].sessionId === request.body.sessionId;
        var isSessionOpen = sessions[i].isOpen === true;
        if (isSessionEqual && isSessionOpen) {
            sessions[i].isOpen = false;
            foundSession = {'response':"Session " + sessions[i].sessionId + " is closed"};
            response.statusCode = 200;
        }
    }
    
    updateSessions(sessions);

    response.json(foundSession);
});

app.get('/view', (request, response) => {
    var sessions = getJsonItems(sessionsFileName);
    var users = getJsonItems(usersFileName);

    requestSessionId = request.query.sessionId;

    var session = sessions.find(s => s.sessionId === requestSessionId);
    var responseText = {'response':"Session is closed or couldn't be found"};
    response.statusCode = 400;
    
    if (session !== undefined && session.isOpen === true) {
        var user = users.find(u => u.username == session.username);
        if (user !== undefined && !request.query.page) {
            responseText = {'sessionId': requestSessionId,
            'responseText': user.text};
            response.statusCode = 200;
        } else if (user !== undefined) {

            responseText = getTextByPage({'sessionId': requestSessionId,
            'responseText': user.text}, 
            parseInt(request.query.page), parseInt(request.query.pageSize));
            response.statusCode = 200;
        }
        
    }

    response.json(responseText);
});

app.put('/update', (request, response) => {
    var sessions = getJsonItems(sessionsFileName);
    var users = getJsonItems(usersFileName);

    var responseMessage = "Session is closed or couldn't be found";
    response.statusCode = 400;

    for (var i in sessions) {
        var isSessionEqual = sessions[i].sessionId === request.body.sessionId;
        var isSessionOpen = sessions[i].isOpen === true;
        if (isSessionEqual && isSessionOpen) {
            user = users.find(u => u.username == sessions[i].username);
            if (user !== undefined) {
                user.text = request.body.text;
                responseMessage = "Text has been changed";
                response.statusCode = 200;
            }
            
        }
    }

    updateUsers(users);

    response.json({'response': responseMessage});

});

app.listen(3000, () => {
    console.log("Server is started on localhost:3000");
});