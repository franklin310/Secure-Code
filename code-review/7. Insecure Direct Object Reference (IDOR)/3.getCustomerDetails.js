export function getCustomerDetails(req, res) {
    const email = req.body.email;
    const PromiseRef = CustomerServiceObj.getCustomerDetails(email)
        .then(customer => {
            if(!customer || !customer.length){
                res.status(HTTP_STATUS.NOT_FOUND).send({message: 'Customer is not found.'});
                return PromiseRef.cancel();
            }
            return {customer: customer}                
        })
        .then(customer => res.status(HTTP_STATUS.SUCCESS).send(customer))
        .catch(error => res.status(HTTP_STATUS.ERROR).send({message: error + 'Something went wrong.'}));
}