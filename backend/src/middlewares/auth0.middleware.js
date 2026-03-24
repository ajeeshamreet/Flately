
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
    audience : process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
})


// when we export in an array we can say that both of thee functions will run uin order 

const attachUserId = (req, res, next) => {
    if(req.auth && req.auth.payload){
        req.userId = req.auth.payload.sub;
    }
    next();   
    
}

module.exports = [checkJwt, attachUserId];