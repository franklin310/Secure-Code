router.post('/createInvoice', function(req, res, next) { 
    if (!req.files) 
    return res.status(400).send('No files were uploaded.'); 

    let supportAgreementDoc = req.files.document; 
    var fileName = req.files.document.name; 
    if (req.files.document.mimetype != 'application/msword' && 
        req.files.document.mimetype != 'application/msexcel' && 
        req.files.document.mimetype != 'application/pdf') { 
        return res.redirect('/generateInvoice?status=invalid'); 
    } 
    supportAgreementDoc.mv('./public/docs/' + fileName, function(err) { 
        if (err) 
        return res.status(500).send(err); 

    req.body['document'] = fileName; 
    invoiceQuery.createInvoice(req.body, function(status) { 
        if (status == 'success') { 
            var path = req.body.dirName; 
            if (!fs.existsSync(path)) { 
                child_process.exec('mkdir ' + path, function(cperr, stdout, stderr) { 
                    if (cperr !== null) { 
                        return err; 
                    } 
                }); 
            } 
            var replaceString = [ 
                '#name', '#address', '#phone', '#email', '#amount', '#date', '#serviceType', '#make', '#vehicleNo' 
            ]; 
            var invoiceHtml = util.replaceBulk(html, replaceString, [ 
                req.body.name, req.body.address, req.body.phone, req.body.email, 
                req.body.amount, req.body.date, req.body.serviceType, req.body.make, req.body.vehicleNo 
            ]); 
            pdf.create(invoiceHtml, options).toFile(path + '/invoice_' + req.body.vehicleNo + '.pdf', function(err, res) { 
                if (err) return err; 
            }); 
        } 
        res.redirect('/generateInvoice?status=' + status); 
    }); 
}); 
});