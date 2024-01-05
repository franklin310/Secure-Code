exports.getUserInfo = function (username, cb) {
    db.get("SELECT username,password,email,failure_attempt, account_status FROM USER_INFO WHERE username = ?", [username], function (err, row) {
        if (err) {
            console.log(err);
            return cb({});
        }
        return cb(row);
    });
};
