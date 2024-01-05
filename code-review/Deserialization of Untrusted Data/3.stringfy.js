'use strict';
import CustomerService from './customer.service';
import bcrypt from 'bcrypt-nodejs';
const CustomerServiceObj = new CustomerService();

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
    const PromiseRef = CustomerServiceObj.loginCustomer(payload)
        .then(customer => {
            if(!customer || !customer.length){
                res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Incorrect Credentials'});
                return PromiseRef.cancel();
            }else if (!bcrypt.compareSync(password, customer[0].Password)){
                res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Incorrect Credentials'});
                return PromiseRef.cancel();
            }
            return CustomerServiceObj.updateCustomer(payload)
                .then(token => {
                    delete customer.password;
                    const tokenCookie = JSON.stringify({token: token});
                    res.cookie('token',tokenCookie);
                    return {
                        customer: customer
                    }
                })
                .catch(error => res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'}))
        })
        .then(customerWithToken => res.status(HTTP_STATUS.SUCCESS).send(customerWithToken))
        .catch(error => res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'}));
}

export function custProfile(req, res) {
    const customer = req.customer;
    if(!customer)
        return res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Customer is not found.'});
    const result = {
        name: customer.Name,
        email: customer.Email,
        address: customer.Address,
        city: customer.City
    };
    res.status(HTTP_STATUS.SUCCESS).send(result);
}