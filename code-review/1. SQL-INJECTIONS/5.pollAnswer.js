updateAnswer: function(_id, answer, callback) { 
    if (answer == 0 || answer == 1) { var query = (answer == 1) ? 'UPDATE quiz SET YesCount = YesCount + 1 WHERE _id = ?' : 'UPDATE quiz SET NoCount = NoCount + 1 WHERE _id = ?'; 
    pool.getConnection(function(err, connection) { 
        connection.query(query, [_id], function(err, rows) { 
            connection.release(); 
            err ? callback(err) : callback(null, rows); 
            return 
        }); 
    }); 
} else { 
    callback(new Error('Invalid Response')); 
} 
}