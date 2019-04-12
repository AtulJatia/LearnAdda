var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var app = express();
var {loginUser} = require('./controllers/auth');
var {registerUser} = require('./controllers/auth');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var quizRouter = require('./controllers/quiz');
var {Student,Teacher} = require('./models/User');


app.use(cookieParser());
app.use(session({secret:"Shh it's a secret"}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.set('view engine','ejs');
app.set('engine','html').renderFile;
app.use(express.static('public'));
app.set('views','views');

//QUIZ 
app.use('/quiz',quizRouter);

app.get('/',(req,res)=> {
    console.log(req.session.user);
    res.render("index1",{req : req});
})

// AUTHENTICATION

app.get('/login',(req,res) => {
    res.render("login",{title : "Sign In With"});
})

app.get('/register',(req,res) => {
    res.render("register",{message : ""});
})

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
})

app.post('/login',(req,res) => {
    var data = req.body;
    loginUser(data).then((data) => {
        req.session.user = data;
        res.redirect('/');
    })
    .catch((err) => {
        console.log("Error")
        res.render("login",{title : "Error Try again"})
    })
})

const ifRegistered = (obj) => {
    return new Promise((resolve,reject) => {
        if(obj.type == 'student')
        {
            Student.find({name : obj.name},function(err,db)
        {
            if(err)
                reject(err);
            console.log(db);
            if(db[0] == null)
                resolve("Student not found hence new User");
            reject("Student exists");
        })
        }
        else 
        {
            Teacher.find({name : obj.name},function(err,db)
            {
                if(err)
                    reject(err);
                if(db[0] == null)
                    resolve("Teacher not found hence new User");
                reject("Teacher exists");            
            })
        }
    })
}

app.post('/register',(req,res) => {
    var data = req.body;
    req.session.info = 
            { type : data.person,
              name : data.name }
    console.log(req.session);
    ifRegistered(req.session.info)
    .then(someresult => {
        console.log(data);
        if(!(data.password == data.cnfpassword))
        {
            res.render("register",{message : "Passwords don't match"})
        }
        registerUser(data).then((data) => {
            req.session.user = data;
            res.redirect("/");
        })
        .catch((err) => {
            console.log("Error")
            res.render("error",{message : "Error registering user"})
        })
    })
    .catch(err => {
        console.log("$$$$$$$$$USER FOUND$$$$$$$")
        console.log(err)
        res.render('error',{message : "User Already Exists"});
    })
})
// END OF AUTHENTICATION


app.post('/formdata',(req,res) => {
    res.redirect('/');
})

//STORAGE OF FILES

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        callback(null,file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).array("imgUploader", 3); 


app.post('/upload',(req,res) => {
    upload(req, res, function(err) {
        if (err) {
            return res.render("error",{message : "Something went wrong!"});
        }
        res.redirect('/');
    });
})

app.post('/download',(req,res) => {
    res.sendFile(__dirname+'/uploads/'+req.body.file);
})

app.get('/error',(req,res) => {
    res.render('error');
})

app.listen(3000,() => {
    console.log("Server listening at port 3000");
})