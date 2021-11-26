const jwt = require('jsonwebtoken')

module.exports = (req, res , next) => {
    const authHeader = req.get('Authorization')
    let decodedToken
  
    if(!authHeader){ 
        req.isAuth = false;
        return next()
    }
    const token = authHeader.split(' ')[1]    
    try {
        
        const decodedToken = jwt.verify(token,'somesupersecretsecret')
        if(!decodedToken){
           
            req.isAuth = false;
            return next()
        }
        req.userId = decodedToken.userId
        req.isAuth = true;
        next()

    } catch (error) {     
        req.isAuth = false;
        return next()
    }
}