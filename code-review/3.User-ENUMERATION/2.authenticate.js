authenticate : (email = email.toString(), pass = pass.toString(), cb) => { 
    users.findOne({ email }, (err, doc) => { 
        if (err) { 
            return cb(err); 
        } 
        if (doc && doc.accountLock) { 
            return cb(null, null, 'Account is Locked'); 
        } 
        const hash = doc ? doc.hash : '.............'; 
        bcrypt.compare(pass, hash, (err, passMatch) => { 
            if (doc && passMatch) { 
                return cb(null, doc); 
            } 
            return cb(null, null, 'Invalid email or password'); 
        }); 
    }); 
}