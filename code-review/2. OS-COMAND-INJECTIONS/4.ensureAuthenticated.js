router.post('/controlPanel', ensureAuthenticated, function(req, res, next) { 
    var operationHash = { '0': 'start', '1': 'shut_down', '2': 'suspend'}; 
    var operation = req.body['operation']; if(operationHash[operation]) { 
        exec('controlPanel.sh --action \''+ operationHash[operation] +'\'', function(err, stdout, stderr) { 
            req.flash('success_messages', util.inspect(stdout)); 
            req.flash('error_messages', util.inspect(stderr)); 
            if (err !== null) { 
                req.flash('error_messages', util.inspect(err)); 
            } 
            res.redirect(303, '/controlPanel'); 
        }); 
    } else { 
        var err = new Error('Unauthorized operation'); 
        err.status = 400; 
        return next(err); 
    } 
});