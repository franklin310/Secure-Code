router.post('/updateReactorStatus', auth.authenticationCheck, function(req, res, next) { 
    if (req.session.user.role !== constant.role.admin) { 
        return res.status(403).send({ 
            status: constant.reject 
        }); 
    } 
    if (req.body.cmdId && req.body.reactorId) { 
        execFile("cmd /c ../resources/reactorControl.bat -"+req.body.reactorId+" -"+ req.body.cmdId, function(err, stdout, stderr) { 
            if (err !== null) { 
                console.log(err); 
            } 
        }); 
    } else { 
        return res.status(400).send({ 
            status: constant.reject 
        }); 
    } 
    reactor.updateReactorStatus(constant.command.getCommandId(req.body.cmdId), req.body.reactorId, function(status) { 
        return res.json({ 
            status: status 
        }); 
    }); 
});

