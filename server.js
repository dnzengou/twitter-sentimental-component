/**
 * Created by Zeeshan Hassan on 8/20/14.
 */

var http = require('http'),
    fs = require('fs'),
    comp = require('./component'),
    util = require('./util'),
    filter = process.argv[2] || 'Java',
    fileName = process.argv[3],
    sentiment = require('sentiment'),
    lineSeparator = function () {
        console.log(' -- ')
    };

var streams = [];

util.loadKeywords()
    .then(function (keywords) {
        for (var i in keywords) {
            streams[i] = {};
            streams[i].keyword = keywords[i];
            streams[i].stream = new comp(keywords[i]);
            streams[i].stream.init();
            streams[i].stream.on('tweet', function (data) {
                console.log(data.keyword + " ---- " + data.tweetSentiment + " ---- " + data.tweetTotalSentiment+ " ---- " + data.tweetCount );
            });
        }
    }).fail(function (err) {
        console.log('Error while loading Keywords.', err);
    });


/* Ctrl+c to stop streaming */
process.on('SIGINT', function () {
    lineSeparator();
    console.log("Streaming Stopped...");
    process.exit();
});

process.on('uncaughtException', function (err) {
    lineSeparator();
    console.log("Caught exception...");
    lineSeparator();
    console.log("Check your keys");
    process.exit();
});

require('socket.io').listen(http.createServer(function (req, res, next) {

    fs.readFile(__dirname + '/stream.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error while loading. Try Again !');
            }
            res.writeHead(200);
            res.end(data);
        });

}).listen(3000)).sockets.on('connection', function (socket) {

        for (var i in streams) {

            socket.emit('keywords', streams[i].keyword);

            streams[i].stream.on('tweet', function (data) {
                socket.emit('twitter', data);
            });

        }

    });
