exports.delete = function (req, callback) {
    var id = req.params.id;
    userFile.findOne({fileId: id, userId: req.user._id}, function (err, data) {
      if (err) {
        return cb(err);
      }
      if (data.w || data.rw) {
        async.series([function (next) {
          File.findById(id, function (err, file) {
            if (err) return next(err);
            fs.unlink(path.join(config.dir.path, config.dir.name, file.diskFile), function (err) {
              return next(err);
            })
          })
        }, function (next) {
          File.remove({_id: id}, function (err, result) {
            next(err, result);
          })
        }, function (next) {
          userFileService.delete(id, function (err, result) {
            next(err, result);
          })
        }], function (err, result) {
          callback(err, result);
        })
      } else {
        return callback(new Error("You do not have permission to delete"));
      }
  
    });
  };
  
  /* User should have a mapping entry for the file */
  /* User should have access to that file with either R or RW */
  exports.downloadFile = function (req, callback) {
    var id = req.params.id;
  
    File.findById(id, function (err, file) {
      callback(err, file);
    });
  
  };
  
  exports.checkFileName = function (req, callback) {
  
    File.count({fileName: req.params.filename.trim()}, function (err, count) {
      callback(err, count);
    });
  };