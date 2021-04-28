const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    tokens:[{
        token: {type: String, required: true}
    }]
})

adminSchema.methods.generateAuthTokens = async function(){
    try{
        const token = jwt.sign({_id: this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token})
        console.log(token)
        await this.save()
        return token
    }catch(err){
        console.log(err)
    }
}

const Admin = new mongoose.model('Admin', adminSchema)

module.exports = Admin;