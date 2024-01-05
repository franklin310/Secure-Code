updateAnswer: function(_id, answer, callback) {
    pool.getConnection(function (err, connection) {
        var ans = parseInt(answer);
        if (ans) {
            var query = 'UPDATE quiz SET YesCount = YesCount + value WHERE _id = "quizId"'.replace('value', ans).replace('quizId', _id);
            connection.query(query, function (err, rows) {
                connection.release();
                err ? callback(err) : callback(null, rows);
                return;
            });
        } else {
            var query = 'UPDATE quiz SET NoCount = NoCount + 1 WHERE _id = "quizId"'.replace('quizId', _id);
            connection.query(query, function (err, rows) {
                connection.release();
                err ? callback(err) : callback(null, rows);
                return;
            });
        }
    });
}
