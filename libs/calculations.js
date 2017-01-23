var debug = require("debug")("calculations");
var data = require("./data.js");
var Q = require("q");

function calculateScore(source_id) {
    var deferred = Q.defer();

    data.Rating.findAll({where: {source_id: source_id}}).then(function(ratings) {
        var score = 0;
        var count = 0;

        for(var r in ratings) {
            score += ratings[r].dataValues.score;
            count++;
        }

        score = score/count;
        debug("Source "+source_id+" now has score "+score);

        data.Source.update({score: score}, {where: {id: source_id}}).then(function(response) {
            deferred.resolve(response);
        }).catch(function(err) {
            deferred.reject(err);
        });
    }).catch(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}