var routes = {
    index: function(req, res, next) {
     var condition = req.isAdminUser ? {} : {user_id: req.session.user.id};
   
     if (typeof req.query.type !== 'undefined' && '' != req.query.type) condition.leave_type = req.query.type;
   
     leaveModel.all(condition, function(err, results) {
           if (err) {
               return next(err);
           }
           else {
               res.render("leave/index", {title: "Leave applications", results: results, isAdmin: req.isAdminUser, userId: req.session.user.id});
           }
       });
    },
   
    new: function(req, res) {
     res.render("leave/new", {userId: req.session.user.id});
    },
   
    create: function(req, res, next) {
     if (
      !req.body.leave_type && validator.isEmpty(req.body.leave_type) ||
      !req.body.from_date && validator.isEmpty(req.body.from_date) ||
      !req.body.to_date && validator.isEmpty(req.body.to_date) ||
      !req.body.leave_reason && validator.isEmpty(req.body.leave_reason)
     ) {
      res.redirect("/leaves/new");
     }
     else {
      leaveModel.create(
       req.body.user_id,
       validator.escape(req.body.leave_type),
       validator.toDate(req.body.from_date),
       validator.toDate(req.body.to_date),
       validator.escape(req.body.leave_reason),
       function(err, result) {
                   if (err)
                       return next(err);
                   else {
                       res.redirect("/leaves");
                   }
               });
     }
    },
   
    delete: function(req, res, next) {
         leaveModel.delete(req.body.leave_id, req.body.user_id, function(err, rows) {
             if (err)
                 return next(err);
             else
                 res.redirect("/leaves");
         });
     },
   
    renderUpdateStatus: function(req, res, next) {
     leaveModel.findOne(req.params.leave_id, function(err, result) {
      if (err) return next(err);
   
      res.render('leave/updateStatus', {
       title: "Update Leave Status",
       leaveId: req.params.leave_id,
       savedStatus: result.leave_status,
       statuses: config.leaveStatuses
      });
     });
    },
   
    updateStatus: function(req, res, next) {
     leaveModel.updateStatus(req.body.status, req.params.leave_id, function(err, results, fields) {
      if (err) return next(err);
      if (results.affectedRows == 1) return res.redirect('/leaves');
      return next(new Error('Something went wrong while update leave status'));
     });
    },
   
    leaveInfo: function(req, res, next) {
     if (req.session.user.username != req.params.username) return next(new Error('Access denied!'));
     leaveModel.count(req.params.username, function(err, result, fields) {
      if (err) return next(err);
      res.render('leave/info', {
       title: 'Leave Information',
       leaves: result
      });
     });
    }
   }