"use strict";
const crypto = require('crypto');
import config from '../config/environment';
const algorithm = 'aes-256-gcm';
/*
To encrypt and decrypt the content
 */
class CryptoManager {
    encrypt(initialVector, text){
        var cipher = crypto.createCipheriv(algorithm, config.encryptSecret, initialVector)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        var tag = cipher.getAuthTag();
        return {content: crypted, tag: tag};
      };
     decrypt(initialVector, encrypted){
        var decipher = crypto.createDecipher(algorithm, config.encryptSecret, initialVector)
        decipher.setAuthTag(encrypted.tag)
        var dec = decipher.update(encrypted.content,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
      }
}
module.exports = new CryptoManager();