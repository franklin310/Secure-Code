'use strict';
import TokenManager from './token-manager';
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
  ensureAdminUserAuth,
  updateProductPrice
);

module.exports = router;

function ensureAdminUserAuth(req, res, next) {
  let userType = TokenManager.getFromToken(
    req.body.token,
    'userType'
  );

  if (userType == "admin") return next();
  return res.redirect(303, '/');
}