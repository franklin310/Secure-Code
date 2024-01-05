export function login(req, res){ 
    const email = req.body.email; 
    const password = req.body.password; 
    if(!email) 
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({message: 'Please provide Email.'}); 
    if(!password) 
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({message: 'Please provide Password.'}); 
    const payload = { 
        email: email, 
        password: password 
    }; 
    const PromiseRef = CustomerServiceObj.getCustomerDetails(payload.email) 
        .then(customer => { 
            if(!customer || !customer.length){ 
                res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Customer is not found.'}); 
                return PromiseRef.cancel(); 
            } 
            return argon2.verify(customer[0].password, password) 
            .then(function(bres){ 
                if(!bres){ 
                    res.status(HTTP_STATUS.NOT_FOUND).send({ 
                        message: 'Password is not correct'}); 
                        return PromiseRef.cancel(); 
                    } 
                return CustomerServiceObj.addSessionToken(payload) 
                .then(token => { 
                    const tokenCookie = serialize.serialize({token: token}); 
                    res.cookie('token',tokenCookie); 
                    return { customer: 
                        customer, 
                        token: token 
                    } 
                }) 
                .catch(error => res.status(HTTP_STATUS.ERROR).send({ 
                    message: 'Something went wrong.'})); 
                }); 
            }) 
            .then(customerWithToken => res.status(HTTP_STATUS.SUCCESS).send(customerWithToken)) 
            .catch(error => res.status(HTTP_STATUS.ERROR).send({message: error + 'Something went wrong.'})); 
        }