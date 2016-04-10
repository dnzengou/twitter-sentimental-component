var fs = require('fs'),
    q = require('q');

exports.loadKeywords = function () {
    var deferred = q.defer();
    fs.readFile('./keywords', 'utf8', function (err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(data.split(','));
        }
    });
    return deferred.promise;
}