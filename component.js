/**
 * Created by Zeeshan Hassan on 8/20/14.
 */

var events = require('events'),
    sentiment = require('sentiment'),
    Twit = require('twit'),
    config = require('./config');

function Stream(filter) {
    this.filter = filter;
    this.keyword = filter;
    this.tweetCount = 0;
    this.tweetTotalSentiment = 0;

    this.twit = new Twit({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        access_token: config.access_token,
        access_token_secret: config.access_token_secret,
        timeout_ms: 60 * 1000  // optional HTTP request timeout to apply to all requests.
    });

    events.EventEmitter.call(this);

    this.tweet = function (data) {
        this.emit('tweet', data);
    }

    this.stop = function () {
        console.log("Stopping now...");
        process.exit();
    }

    this.init = function (filter) {
        var that = this;
        console.log('init called ' + that.filter);
        this.twit.stream('statuses/filter', {'track': that.filter, language: 'en'})
            .on('tweet', function (data) {
                sentiment(data.text, function (err, result) {
                    that.tweetCount++;
                    that.tweetTotalSentiment += result.score;
                    data.keyword = that.filter;
                    data.tweetCount = that.tweetCount;
                    data.tweetTotalSentiment = that.tweetTotalSentiment;
                    data.tweetSentiment = result.score;
                    that.tweet(data);
                });
            })
            .on('end', function (response) {
                console.log('Disconnected');
                // Handle a disconnection
            })
            .on('destroy', function (response) {
                // Handle a 'silent' disconnection from Twitter, no end/error event fired
                console.log('Twitter Disconnected');
            });
    }
}

Stream.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Stream;
