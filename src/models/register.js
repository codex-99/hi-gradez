const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    emailId: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    adharNumber: {type: String, required: true, unique: true},
    tokens:[{
        token: {type: String, required: true}
    }]
});

userSchema.methods.generateAuthTokens = async function(){
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

const Register = new mongoose.model('Register', userSchema);

module.exports = Register;
