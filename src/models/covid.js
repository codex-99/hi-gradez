const mongoose = require('mongoose');

const covidSchema = new mongoose.Schema({
    adharNumber: {type: String, required: true},
    result: {type: String, required: true},
    date: {type: Date, required: true},
    sampleId: {type: String, required: true, unique: true},
    sampleCollect : {type: String, required: true},
    testingUnderProcess : {type: String, required: true}
})

const CovidData = new mongoose.model('CovidData', covidSchema)

module.exports = CovidData;