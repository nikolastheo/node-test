'use strict';
var bootstrapService = require('express-bootstrap-service');
var express = require('express');
var app = express();
var router = express.Router();
var fs = require('fs');
var bodyParser = require('body-parser');
var viewPath = __dirname + '\\app\\views\\';
var modelPath = __dirname + '\\app\\models\\';
var dataPath = __dirname + '\\app\\data\\';
var message = require(modelPath + 'message');
var error = require(modelPath + 'error');
var messageStore = dataPath + 'messagesStore.json';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', router);

app.use(bootstrapService.serve);
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap-validator', express.static(__dirname + '/node_modules/bootstrap-validator/dist/'));
app.use('/scripts', express.static(__dirname + '/app/scripts/'));

var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port
    console.log('app listening at http://%s:%s', host, port)
});
router.get('/', function(req, res) {
    res.sendFile(viewPath + 'index.html');
});

router.get('/messages', function(req, res) {
    getMessages(messageStore).then(
        function(messages) {
            var messageDoesNotExist = (typeof messages === 'undefined') || !messages;
            messageDoesNotExist ?
                res.status(404).send('Not Found') :
                res.json(messages);
        },
        function(error) {
            console.log(error);
            res.status(500).send('error!');
        }
    )
});

router.delete('/messages/:id', function(request, response) {
    var newMessage = new message();
    newMessage.id = request.params.id;
    deleteMessage(newMessage, messageStore).then(
        function(message) {
            var messageDoesNotExist = (typeof message === 'undefined') || !message;
            messageDoesNotExist ?
                response.status(404).send('Not Found') :
                response.json(message.id);
        },
        function(error) {
            console.log(error);
            response.status(500).send('error!');
        }
    );
});

router.get('/messages/:id', function(req, res) {
    var newMessage = new message();
    newMessage.id = req.params.id;
    getMessage(newMessage, messageStore).then(
        function(message) {
            var messageDoesNotExist = (typeof message === 'undefined') || !message;
            messageDoesNotExist ?
                res.status(404).send("not Found!") :
                res.json(message);
        },
        function(error) {
            console.log(error);
            res.status(500).send('error!');
        }
    );
});

router.post('/messages', function(req, res) {
    var newMessage = new message();
    var isEmptyBody = ((typeof req.body.id === 'undefined') || !req.body.id) || ((typeof req.body.group === 'undefined') || !req.body.group) || ((typeof req.body.message === 'undefined') || !req.body.message);
    if (isEmptyBody) {
        console.log("Empty Message POST request");
        res.status(500).send('error Values need to be filed!');
    } else {
        newMessage.id = req.body.id;
        newMessage.group = req.body.group;
        newMessage.message = req.body.message;
        newMessage.createdDate = new Date();
        saveMessage(newMessage, messageStore).then(
            function(message) {
                res.json(message.id)
            },
            function(error) {
                console.log(error);
                res.status(500).send('error!');
            }
        );
    }
});

function readJsonFile(jsonFile) {
    return new Promise(function(resolve, reject) {
        fs.readFile(jsonFile, 'utf8', function(error, data) {
            (error) ?
            reject(new Error('{Message: file read error, Method: readJsonFile, File:' + jsonFile)):
                resolve(JSON.parse(data));
        });
    });
}

function writeToJsonFile(jsonFile, stringJson) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(jsonFile, stringJson, function(error) {
            (error) ?
            reject(new Error('{Message: file write error, Method: writeToJsonFile, File:' + jsonFile)):
                resolve(stringJson);
        });
    });
}

function deleteMessage(message, dataStore) {
    return new Promise(function(resolve, reject) {
        readJsonFile(dataStore).then(
            function(dataJson) {
                var messageToDelete = dataJson.messages[message.id];
                var messageExists = typeof(messageToDelete !== 'undefined') && messageToDelete;
                if (messageExists) {
                    delete dataJson.messages[message.id];
                    var stringJson = JSON.stringify(dataJson);
                    writeToJsonFile(dataStore, stringJson).then(
                        function(success) {
                            resolve(messageToDelete);
                        },
                        function(error) {
                            reject(error);
                        }
                    );
                } else {
                    resolve(messageToDelete);
                }
            },
            function(error) {
                reject(error);
            }
        )
    });
}

function getMessage(message, dataStore) {
    return new Promise(function(resolve, reject) {
        readJsonFile(dataStore).then(
            function(dataJson) {
                resolve(dataJson.messages[message.id]);
            },
            function(error) {
                reject(error);
            });
    });
}

function getMessages(dataStore) {
    return new Promise(function(resolve, reject) {
        readJsonFile(dataStore).then(
            function(dataJson) {
                resolve(dataJson.messages);
            },
            function(error) {
                reject(error);
            }
        );
    });
}

function saveMessage(message, dataStore) {
    return new Promise(function(resolve, reject) {
        readJsonFile(dataStore).then(
            function(dataJson) {
                dataJson.messages[message.id] = message;
                var stringJson = JSON.stringify(dataJson);
                writeToJsonFile(dataStore, stringJson).then(
                    function(success) {
                        resolve(message);
                    },
                    function(error) {
                        reject(error);
                    }
                );
            },
            function(error) {
                reject(error);
            }
        );

    });
}