const jwt = require('jsonwebtoken')
const Register = require('../models/register')
const Admin = require('../models/admin')

const auth = async(req,res,next)=>{
    try{

        const token = req.cookies.jwt
        const verify = jwt.verify(token, process.env.SECRET_KEY)

        const user = await Register.findOne({_id:verify._id})
        const admin = await Admin.findOne({_id:verify._id})

        req.token = token
        if(user){

            req.user = user
        }

        if(admin){
            req.user = admin
        }


        next();

    }catch(e){
        res.status(401).send(e)
    }
}

module.exports = auth;