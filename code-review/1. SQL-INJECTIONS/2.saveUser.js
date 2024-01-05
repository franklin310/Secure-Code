exports.saveUser = function(username, password, email, userRole, cb) { 
    let query = "INSERT INTO user_info (username,password, email, failure_attempt, account_status,role_id) " + 
    "VALUES ('{0}','{1}','{2}',{3},'{4}',{5})"; 
    bcrypt.hash(password, 10, function(err, hash) {
        db.run(sf(query, username, hash, email, 0, "ACTIVE", userRole), function(err) { 
            if (err) { 
                console.log(err); 
                cb(constant.reject); 
            } 
            cb(constant.success); 
        }); 
    }); 
};