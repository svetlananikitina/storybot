'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var https = require('https');
var imageSearch = require('node-google-image-search');
var querystring = require('querystring');
var request = require('request');
var flow = require('nimble');


function callback(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        var body = JSON.parse(chunk);
        if (body.type === 'msg') {
            io.emit('receive-message', body.msg);
        }
        if (body.type === 'action' && body.action === 'show_place') {
            if (body.entities.location  && body.entities.location[0].value) {
                // io.emit('receive-message', ['https://s.inyourpocket.com/gallery/107415.jpg',
                //     'https://media-cdn.tripadvisor.com/media/photo-s/01/1a/aa/11/magestic-view-on-swisloch.jpg',
                //     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2N6AugSaEYx-d75dO-PTzONhmNdWGQ-fUOPfIuyITw9CDYnWy7w']);
                imageSearch(body.entities.location[0].value, function (results) {
                    var results = results.map(function (elem) {
                        return elem.link;
                    });
                    io.emit('receive-message', results);
                }, 0, 4);
            }
        }
    });
}

function chat_to_bot(data) {
    var msg = data[0];
    var session_id = data[1];
    var options = {
        host: 'api.wit.ai',
        port: 443,
        path: '/converse?' + querystring.stringify({v:20170611,
                                                    session_id: session_id,
                                                    }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer W5Y3RZQ4J5AJWJZXVP7R5RPVAVVHAVSW'
        }
    };
    if (msg) {
        options.path = options.path + "&" + querystring.stringify({q:msg});
    }
    var req = https.request(options, callback);
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    // req.write();
    req.end();
}



io.on('connection', function (socket) {
   console.log('we have a connection');
   socket.on('new-message', function (data) {
       flow.series([
           function(callback){
               setTimeout(function(){
                   chat_to_bot(data);
                   console.log('I execute first');
                   callback();
               },400);
           },
           function(callback){
               setTimeout(function(){
                   chat_to_bot(['', data[1]]);
                   console.log('I execute second');
                   callback();
               },500);
           },
           function(callback){
               setTimeout(function(){
                   chat_to_bot(['', data[1]]);
                   console.log('I execute third');
                   callback();
               },600);
           },
       ]);
   });
});

http.listen('3000', function () {
    console.log('we are connected');
});