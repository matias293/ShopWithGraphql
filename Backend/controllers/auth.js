const {validationResult} = require('express-validator') 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const {email,password, name} = req.body
    bcrypt.hash(password, 12)
    .then(hashedPas => {
        const user = new User({
            email,
            password: hashedPas,
            name
        })
        return user.save()
    })
    .then(result=> {
        res.status(201).json({message:'User created', userId: result._id})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
}

exports.login =  (req,res,next) => {
    const {email , password} = req.body
    let loadedUser
    User.findOne({email})
    .then(user=> {
        
        if(!user){
            const error = new Error(' Invalid email or password ')
            error.statusCode = 401
            throw error
        }
      loadedUser = user 
      return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
        
        if(!isEqual){
            const error = new Error('Invalid email or password')
            error.statusCode = 401
            throw error
        }
        const token = jwt.sign({
            email : loadedUser.email,
            userId : loadedUser._id.toString()
        },'secretshhh', {expiresIn: '1h'}
        )
    res.status(200).json({token, userId:loadedUser._id.toString()})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
}

exports.getUserStatus = (req,res,next) => {
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User not found')
            error.statusCode = 401
            throw error
        }
        res.status(200).json({status:user.status})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })

}

exports.updateUserStatus = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const {status} = req.body
    
    return User.findByIdAndUpdate(req.userId,{status})
    .then(user => {
        res.status(200).json({status:user.status})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
}