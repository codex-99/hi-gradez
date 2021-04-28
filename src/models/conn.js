const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/higradez-app-db',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log('MongoDb Connection established')
}).catch((e)=>{
    console.log('Error: ',e)
})

