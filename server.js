require('dotenv').config()
const express = require('express')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const path = require('path')
const hbs = require('hbs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

require("./src/models/conn")
const Register = require('./src/models/register')
const Generate = require('./src/models/data')
const CovidData = require('./src/models/covid')
const Admin = require('./src/models/admin')

const auth = require('./src/middleware/auth')

const app = express();
const port = process.env.PORT || 8000;
const static_path = path.join(__dirname, './public')
const template_path = path.join(__dirname, './templates/views')
const partial_path = path.join(__dirname, './templates/partials')

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use(express.static(static_path));
app.set('view engine', 'hbs');
app.set('views',template_path);
hbs.registerPartials(partial_path)

app.get('/',(req,res)=>{
    res.render("index")
})

app.get('/register',(req,res)=>{
    res.render("register")
})

app.get('/registerH',(req,res)=>{
    res.render("registerH")
})

app.get('/loginH',(req,res)=>{
    res.render("loginH")
})

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/change_password',(req,res)=>{
    res.render("changePwd")
})
app.get('/account', auth,async (req,res)=>{
    try{

        const token = req.cookies.jwt
        console.log(token)
        const verify = jwt.verify(token, process.env.SECRET_KEY)

        const userDetails = await Register.findOne({_id:verify._id})
        const userDatabase = await Generate.findOne({adharNumber:userDetails.adharNumber})
        const userCovidData = await CovidData.findOne({sampleId:userDatabase.sampleId})

        res.render('account',{ 
            name:userDetails.firstName,
            age:userDatabase.age,
            sample: userDatabase.sampleId,
            date: userDatabase.date
        })
        

    }catch(e){
        console.log(e)
    }
})
app.get('/history',auth,async(req,res)=>{
    try{

        const token = req.cookies.jwt
        const verify = jwt.verify(token, process.env.SECRET_KEY)

        const userDetails = await Register.findOne({_id:verify._id})
        const userDatabase = await Generate.findOne({adharNumber:userDetails.adharNumber})
        const userCovidData = await CovidData.findOne({sampleId:userDatabase.sampleId})

        CovidData.find((err,data)=>{
            res.render('history',{dataList: data})
        })
        

    }catch(e){
        console.log(e)
    }
})

app.get('/logout',auth, async (req,res)=>{
    try{

        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token != req.token;
        })

        res.clearCookie("jwt");
        console.log("Logout Success!");
        await req.user.save();
        res.render("login");
    }catch(e){
        res.status(500).send(e)
    }
})

app.get('/dashboard',auth,(req,res)=>{
    console.log("Cookie is : "+ req.cookies.jwt)
    res.render("dashboard")
})

app.get('/userM',auth, async(req,res)=>{
    try{
        console.log('userM')
        const userCovidData = await CovidData

        userCovidData.find((err,data)=>{
            res.render('userM',{dataList: data})
        })
        

    }catch(e){
        console.log(e)
    }
})

app.post('/register',async(req,res)=>{
    try{
        const pwd = req.body.password;
        const cpwd = req.body.confirmPassword;
        if(pwd === cpwd){
            const passwordHash = await bcrypt.hash(req.body.password, 10);
            const userRegister = new Register({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                emailId: req.body.emailId,
                password: passwordHash,
                phoneNumber: req.body.phoneNumber,
                adharNumber: req.body.adharNumber
            })

            const token = await userRegister.generateAuthTokens();
            console.log("token is: ", token);

            res.cookie("jwt", token,{
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            })

            const registered = await userRegister.save();
            console.log("Success!");
            res.status(201).render("index");

        }else{
            res.send("Password not same")
        }

    }catch(error){
        if(error.code === 11000){
            res.status(400).send('Account exist! Sign in instead')
        }else{res.status(400).send(error)}
    }
})

app.post('/login',async(req,res)=>{
    try{
        const emailId = req.body.emailId
        const password = req.body.password

        const userDetails = await Register.findOne({ emailId})

        //console.log(userDetails)
        
        const result = await bcrypt.compare(password, userDetails.password)


        const token = await userDetails.generateAuthTokens();

        res.cookie("jwt", token,{
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        })

        if(result){
            res.status(201).render('index')
        }else{
            res.status(400).send("Invalid Credentials")
        }
    }
    catch(error){
        console.log(error)
    }
})

app.post('/change_password', async (req, res)=>{
    try{
        const oldPwd = req.body.oldPassword
        const newPwd = req.body.newPassword
        const confirmPwd = req.body.confirmPassword
        const emailId = req.body.emailId

        const userDetails = await Register.findOne({ emailId})

        const result = await bcrypt.compare(oldPwd, userDetails.password)

        if(result){
            if(newPwd === confirmPwd){
                const passwordHash = await bcrypt.hash(newPwd, 10)
                const r = await Register.findByIdAndUpdate({_id:userDetails._id},{
                    $set:{
                        password: passwordHash
                    }
                    },
                    {
                        useFindAndModify: false
                    })
                res.status(201).render('login')
            }
            else{
                res.send("Invalid Input")
            }
        }
    }catch(e){
        console.log(e)
    }

})

app.post('/dashboard', async(req,res)=>{
    try{
        const age = req.body.age
        const dat = req.body.date
        const symptoms  = req.body.symp

        const token = req.cookies.jwt
        const verify = jwt.verify(token, process.env.SECRET_KEY)

        const userDetails = await Register.findOne({_id:verify._id})

        console.log(userDetails.firstName)
        
        
        const userDataGenerate = new Generate({
            adharNumber: userDetails.adharNumber,
            age: age,
            date: dat,
            sampleId: "Id"
        })
        
        //const symptom = await userDataGenerate.passUserData(symptoms);
        
        const registered = await userDataGenerate.save();
        console.log("Success!", userDataGenerate);
        res.status(201).render("index");
        
        const count = await Generate.countDocuments({date:dat})

        console.log("Count is: ",count)

        const sampleId = dat.toString().substring(8,10)+dat.toString().substring(5,7)+userDetails.firstName.substring(0,2)+count.toString()


        const result = await Generate.findByIdAndUpdate({_id:userDataGenerate._id},{
            $set:{
                sampleId: sampleId
            }
            },
            {
                useFindAndModify: false
            })
        const r = await Generate.findByIdAndUpdate({_id:userDataGenerate._id},{
            $push:{
                symptoms:{symptom: symptoms[0]}
                }
                },
                {
                    useFindAndModify: false
                })

                const userCovid = new CovidData ({
                    adharNumber: userDataGenerate.adharNumber,
                    date: userDataGenerate.date,
                    result: "Null",
                    sampleId: sampleId,
                    sampleCollect : "False",
                    testingUnderProcess : "False"            
                })
        
                const done = await userCovid.save();

        //console.log("age is: "+age+" date is: "+dat+"symptoms are: "+symptoms)
    }catch(error){
        console.log(error)
    }
})

app.post('/registerH', async(req, res)=>{
    try{
        const pwd = req.body.password;
        const cpwd = req.body.confirmPassword;
        if(pwd === cpwd){
            const passwordHash = await bcrypt.hash(req.body.password, 10);
            const adminRegister = new Admin({
                username: req.body.username, 
                password: passwordHash
            })

            const token = await adminRegister.generateAuthTokens();
            console.log("token is: ", token);

            res.cookie("jwt", token,{
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            })

            const registered = await adminRegister.save();
            console.log("Success!");
            res.status(201).render("userM");

        }else{
            res.send("Password not same")
        }

    }catch(error){
        if(error.code === 11000){
            res.status(400).send('Account exist! Sign in instead')
        }else{res.status(400).send(error)}
    }
})

app.post('/loginH',async(req,res)=>{
    try{
        const username = req.body.username
        const password = req.body.password

        const admin = await Admin.findOne({ username})

        //console.log(userDetails)
        
        const result = await bcrypt.compare(password, admin.password)


        const token = await admin.generateAuthTokens();

        res.cookie("jwt", token,{
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        })

        if(result){
            res.status(201).render('indexM')
        }else{
            res.status(400).send("Invalid Credentials")
        }
    }
    catch(error){
        console.log(error)
    }
})

app.post('/userM', async(req,res)=>{
    try{

        const sampleId = req.body.n_id;
        const result = req.body.result;

        console.log(result);

        var sc;
        var t;
        var r;

        if(result === "Sample Collected"){
            sc = "Done"
        }
        if(result === "Testing Under Process"){
            t = "Done"
        }
        if(result === "Covid Positive"||result ==="Covid Negative"){
            r = result
        }

        const userCovidData = await CovidData.findOne({ sampleId})

        const ri = await CovidData.findByIdAndUpdate({_id:userCovidData._id},{
            $set:{
                sampleCollect: sc,
                testingUnderProcess: t,
                result: r
            }
            },
            {
                useFindAndModify: false
            })
        res.render('indexM')

    }catch(e){
        console.log(e)
    }
})

app.listen(port,()=>{
    console.log('Listening on PORT '+port)
});

