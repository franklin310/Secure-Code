var storage = multer.diskStorage({ 
    destination: function(req, file, cb) { 
        var fileDirPath = config.fileUploadBasePath + req.body.user_id; 
        
        fs.stat(fileDirPath, function(err, stats) { 
            if (!stats || !stats.isDirectory()) { 
                child_process.exec('mkdir ' + fileDirPath, function(cperr, stdout, stderr) { 
                    if (cperr !== null) { 
                        console.log(cperr); 
                        return cb(new Error('Something went wrong while uploading the document. Please try again')); 
                    } 
                    return cb(null, fileDirPath); 
                }); 
            } else { 
                return cb(null, fileDirPath); 
            } 
        }); 
    }, 
    filename: function(req, file, cb) { 
        cb(null, uuid.v4()); 
    } 
});