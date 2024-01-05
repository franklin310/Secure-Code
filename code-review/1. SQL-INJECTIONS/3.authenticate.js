var pg = require('pg'); 
var config = require('../config.json'); 
var bcrypt = require('bcrypt'); 
module.exports = { authenticate : function(username, pass, cb) {
     pg.connect(config.connectionString, function(err, client, done) {
         username = username.replace(/(;|or|1'='1')/gi, ''); 
         client.query('SELECT * FROM users WHERE username = \''+username+'\'', function(err, result) {
             done(); 
             var genericError = new Error('Invalid username or password'); 
             if (err) { return cb(genericError); 
            } 
            var user = result.rows[0]; 
            var hash = result.rows[0] 
            ? result.rows[0].hash 
            : '.'; 
            bcrypt.compare(pass, hash, function(err, passMatch) { 
                if (user && passMatch) {
                     return cb(null, result.rows[0]); 
                    } return cb(genericError); 
                }); 
            }); 
        }); 
    } 
};