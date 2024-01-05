'use strict';
import serialize from 'node-serialize';
import CustomerService from './customer.service';
import argon2 from 'argon2';
import TokenManager from './../../common/token-manager';
const CustomerServiceObj = new CustomerService();

export function updateCustomerName(req, res) {
    const reqBody = req.body;
    const email = TokenManager.getFromToken(req.body.token, 'email');
    reqBody.email = email;
    CustomerServiceObj.updateCustomerName(reqBody)
        .then(customer => res.status(HTTP_STATUS.SUCCESS).send({message: 'Customer name has been updated successfully.'}))
        .catch(error => res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'}));
}

export function signup(req, res) {
    const reqBody = req.body;
    CustomerServiceObj.createCustomer(reqBody)
        .then(customer => res.status(HTTP_STATUS.SUCCESS).send({message: 'Customer has been created successfully.'}))
        .catch(error => res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'}));
}

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
                res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Invalid credentials'});
                return PromiseRef.cancel();
            }
            return argon2.verify(customer[0].password, password)
            .then(function(bres){
                if(!bres){
                    res.status(HTTP_STATUS.NOT_FOUND).send({
                        message: 'Invalid credentials'});
                    return PromiseRef.cancel();
                }
            return CustomerServiceObj.addSessionToken(payload)
                .then(token => {
                    const tokenCookie = serialize.serialize({token: token});
                    res.cookie('token',tokenCookie);
                    return {
                        customer: customer,
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