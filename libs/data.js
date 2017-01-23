/** Module **/
var data = {};

var debug = require("debug")("data");
var fs = require("fs");
var Q = require("q");
var Redis = require('promise-redis')(Q.promise);
var Sequelize = require("sequelize");
var sqlize;

/** Globals **/
var config = require('../config/config.js');

/** Redis **/
//createRedisConnection();

/** Redis **/
function createRedisConnection() {
    data.redis = Redis.createClient();

    data.redis.on('ready', function() {
        debug("Redis connected.");
    });

    data.redis.on("error", function (err) {
        debug("Redis Error: " + err);
    });
}

/** MySQL **/
sqlize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password,
        {host: config.mysql.host, dialect: "mysql", port: 3306, logging: false, define: {timestamps: false}});

/** Models **/
data.User = sqlize.define("user", {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    salt: Sequelize.STRING,
    username: Sequelize.STRING
});

data.Source = sqlize.define("source", {
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    group_id: Sequelize.INTEGER,
    score: Sequelize.INTEGER,
    url: Sequelize.STRING
});

data.Content = sqlize.define("content", {
    source_id: Sequelize.INTEGER,
    url: Sequelize.STRING
});

data.Review = sqlize.define("rating", {
    user_id: Sequelize.INTEGER,
    source_id: Sequelize.INTEGER,
    content_id: Sequelize.INTEGER,
    score: Sequelize.INTEGER,
    comments: Sequelize.STRING
});

data.Forum = sqlize.define("forum", {
    source_id: Sequelize.INTEGER,
    content_id: Sequelize.INTEGER
});

data.Post = sqlize.define("post", {
    parent_id: Sequelize.INTEGER,
    forum_id: Sequelize.INTEGER,
    user_id: Sequelize.INTEGER
});

/** Relations **/
data.User.hasMany(data.Post, {foreignKey: "user_id"});
data.Source.hasMany(data.Content, {foreignKey: "source_id"});
data.Source.hasOne(data.Forum, {foreignKey: "source_id"});
data.Source.hasMany(data.Review, {foreignKey: "source_id"});
data.Forum.hasMany(data.Post, {foreignKey: "forum_id"});
data.Forum.belongsTo(data.Source, {foreignKey: "source_id"});
data.Post.hasOne(data.User, {foreignKey: "user_id"});

module.exports = data;