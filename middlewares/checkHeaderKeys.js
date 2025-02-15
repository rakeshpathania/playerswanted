
const helper = require('../helper/helpers')
var aes256 = require('aes256');
var  constant=require('../config/constants')
module.exports = {
    authenticateHeader: async function (req, res, next) {
        try {
        const required = {
        secret_key: req.headers.secret_key,
        publish_key:req.headers.publish_key,
        };
        const non_required = {};
        let requestdata = await helper.vaildObject(required, non_required, res);
        // secret_key = "sk_yW/ispSTYUlXW4AYVTb73AWZELwDxngV4WJ/G3YWNqisoi3XnblRtOvABsN/Cmvnog=="
        // publish_key = "pk_PSn5nbg5cM9HwmNIMhOHrlqf0CBhOQnGyY7iNsiqnkwp6cCc7tXWijf75XIYjq7NFus="
        // if((global.secret_key !==sk_decrypt ) || (global.publish_key !== pk_decrypt)){
        // return helper.failed(res,'Key not matched!')
        // }
        if((req.headers.secret_key !== 'sk_q9hmrmVEjk23/2yC7f6nY3eb/K4COPG9l+8KXcLGQYEnQC0n3OBQPrGUC9qkQOtXw+hlBEM=') || (req.headers.publish_key !== 'pk_0KYaaaP+A/YdQ/tFfG0bC2bXs+eWVY+gJYM4pY9zCgI6fqbmzYx3aBa6CFUybmiNUYziFwSK')){
        return res.json(helper.failed('Key not matched!'));
        }
        next();
        } catch (error) {
        console.log(error,'================error=================')
        return helper.error(res, error);
        }
        }}