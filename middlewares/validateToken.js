const jwt = require('jsonwebtoken');
const Admin_Token =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiVGhlamFzIEhhcmkiLCJwcm9mZXNzaW9uIjoiU0RFIn0.-y9PVxwrhmoELWxCkZWYPwEmmMBieZs5w5A2bzX1VwI"

const Normal_Token = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsIm5hbWUiOiJWaW5heSBLdW1hciIsInByb2Zlc3Npb24iOiJJVCIsInNlY3JldCI6Im15LXNlY3JldCJ9.mCPPWnvUy1FwQhYqLvm26IGq2Iw1EThrcmwAcwYayAM"

const checkTokenSecret = (token) => {
    try {
        return jwt.decode(token).secret === 'my-secret';
    } catch (error) {
        return false;
    }
}

const checkAdminToken = (token) => {
    try {
        return jwt.decode(token).role === 'admin';
    } catch (error) {
        return false;
    }
}

const validateToken = (req,res,next) => {
    if(req.headers['authorization']){
        const token = req.headers['authorization'].split(' ')[1];
        if(checkAdminToken(token)){
            req.admin = true;
            next();
        }else if(checkTokenSecret(token)) {
            next();
        } else{
            res.status(401).send("Incorrect api key")
        }
    }else if(req.url.includes("/auth/google") || 
        req.url.includes("/auth/callback") || 
        req.url.includes("/auth/profile") || 
        req.url.includes("/auth/logout")) {
        next();
    } else {
        res.status(401).send("Missing api key")
    }
}

module.exports = {
    validateToken
}