'use strict';

import express from 'express';

import {
  signup,
  login,
  updateProductPrice,
  getProductDetails
} from './product.controller';

let router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/getProductDetails',
  getProductDetails
);
router.post('/updateProductPrice',
  updateProductPrice
);

module.exports = router;