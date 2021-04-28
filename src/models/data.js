const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    adharNumber: {type: String, required: true},
    symptoms: [{symptom:{type: String}}],
    age: {type: Number, required: true},
    date: {type: Date, required: true},
    sampleId: {type: String, required: true, unique: true}
})

dataSchema.methods.passUserData = async function(symptoms){
    try{
        symptoms.forEach((sym)=>{
            console.log(sym)
            this.symptoms = this.symptoms.concat({sym})
        })
        console.log(symptoms)
        await this.save()
        return symptoms
    }catch(err){
        console.log(err)
    }
}

const Generate = new mongoose.model('Generate', dataSchema)

module.exports = Generate;