var express = require('express');
var router  = express.Router();
var {Quiz} = require('../models/Quiz');
var {StudentQuiz} = require('../models/Quiz');
var mongoose = require('mongoose');
var {Student} = require('../models/User');

mongoose.connect("mongodb://localhost:27017/elearning",function(err,db)
{
    if(err)
        return console.log(err);
    console.log("Connected");
}
);

router.get('/create',(req,res) => {
    res.render('quiz/create');
})

router.post('/create',(req,res) => {
    console.log(req.body);
    var data = req.body;
    var code = data.t;
    var name = data.n;
    var q = [],a=[],b=[],c=[],d=[],o=[];
    for(i in data)
    {
        if(i.indexOf('q')>-1)
        {
            q.push(data[i]);
        }
        if(i.indexOf('a')>-1)
        {
            a.push(data[i]);
        }
        if(i.indexOf('b')>-1)
        {
            b.push(data[i]);
        }
        if(i.indexOf('c')>-1)
        {
            c.push(data[i]);
        }
        if(i.indexOf('d')>-1)
        {
            d.push(data[i]);
        }
        if(i.indexOf('o')>-1)
        {
            o.push(data[i]);
        }
    }
    var quiz = new Quiz({
        quiz_id : code,
        quiz_name : name,
        question : q,
        OptionA : a,
        OptionB : b,
        OptionC : c,
        OptionD : d,
        Correct : o,
        teacher : req.session.user.name
    })
    quiz.save()
    .then(result => {
        console.log(result);
        res.redirect("/");
    })
})

const getQuiz = (val) => {
    return new Promise((resolve,reject) => {
        Quiz.find({quiz_id : val},function(err,db){
            if(err)
            reject(err);
            resolve(db);
        })
    })  
}

const getNameFromId = (id) => {

    return new Promise((resolve,reject) => {
        Quiz.find({quiz_id : id},function(err,db){
            console.log("Entered the name ");
            console.log(db);
            if(err) 
            {
                console.log("Error");
                return reject(err);
            }
            if(db[0] == null)
            {
                return reject("Quiz not found");
            }
            resolve(db[0].quiz_name);
        })
    })
}

const checkAlready = (user,quiz) => {
    return new Promise((resolve,reject) => {
        console.log(user._id,quiz);
        getNameFromId(quiz)
        .then(result => {
            console.log(result);
            StudentQuiz.find({student : user._id,quiz : result},function(err,db){
                if(err) reject(err);
                resolve(db);
        })})
        .catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

router.get('/join',(req,res) => {
    if(req.query.retake)
    console.log(req.query);
    req.session.retake = false;
    console.log(req.session.accesscode);
    checkAlready(req.session.user,req.session.accesscode)
    .then((result) => {
            if(result[0] == null)
            {
                getQuiz(req.session.accesscode)
                .then(result => {
                    // res.json(result);
                    res.render('quiz/join',{obj : result[0]});
                })
                .catch(err => {
                    res.render("error",{message : "Quiz does not exist check again"})
                })
            }
            else 
            {
                res.render("error",{message : "Quiz already taken "});
            }
    })
    .catch(err => 
        {
            console.log(err);
            res.render("error",{message : err});
        })
})

const addScore = (ctr,q,user,length) => {
    return new Promise((resolve,reject) => {
        var studentquiz = new StudentQuiz({
            //student
            student : user._id,
            //quiz
            quiz    : q.quiz_name,
            //score
            score   : ctr,
            total   : length
        })
        studentquiz.save()
        .then(val => 
            {
                resolve("Yes");
            }
        )
    })
}

const updateScore = (ctr,q,user,length) => {
    return new Promise((resolve,reject) => {
        StudentQuiz.update({student : user._id,quiz : q.quiz_name},{score : ctr},function(err,db){
            if(err) reject(err);
            resolve("Updated Score");
        })
    })
}

router.post('/join',(req,res) => {
    console.log(req.body);
    var entirequiz;
    getQuiz(req.session.accesscode)
    .then(result => {
        entirequiz = result;
        return result[0].Correct;
    })
    .then(result => {
        var ctr = 0;
        for(i in req.body)
        {
            var val = i[6];
            var ans = req.body[i];
            if(ans == result[val])
            {
                ctr++;
            }
        }
       
        var length = entirequiz[0].question.length;
        if(req.session.retake == false)
        {
            addScore(ctr,entirequiz[0],req.session.user,length)
            .then(result1 => {
                res.redirect('/');
            })
            .catch(err => {
                console.log(err);
                res.render("error",{message : "Could not Add Score"})
            })
        }
        else if(req.session.retake == true)
        {
            updateScore(ctr,entirequiz[0],req.session.user,length)
            .then(result1 => {
                onsole.log(result1);
                req.session.retake = false;
                res.redirect('/');
            })
            .catch(err => {
                console.log(err);
                res.render("error",{message : "Error updating score"})
            })
        }
    })
    .catch(err => {
        res.render("error",{message : "Something unexpected Please Try Again"})
    })
})

router.post('/access',(req,res) => {
    console.log(req.body);
    req.session.accesscode = req.body.ccode;
    res.redirect("/quiz/join");
})

const getQuizDetails = (user) => {
    return new Promise((resolve,reject) => {
        StudentQuiz.find({student : user._id},function(err,db){
            if(err) reject(err);
            resolve(db);
        })
    })

}

router.get('/getDetails',(req,res) => {
        getQuizDetails(req.session.user)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.json(err);
        })
    })

const getQuizName = (name) => {
    return new Promise((resolve,reject) => {
        console.log(name);
        Quiz.find({quiz_name : name},function(err,db){
            if(err) reject(err);
            resolve(db);
        })
    })
}

router.get('/retake',(req,res) => {
    console.log(req.session.user);  
    console.log(req.query);
    getQuizName(req.query.q)
        .then(result => {
            req.session.accesscode = result[0].quiz_id;
            req.session.retake = true;
            res.render('quiz/join',{obj : result[0]});
        })
        .catch(err => {
            res.render("error",{message : "Quiz does not exist check again"});
        })
})

router.get('/teacherQuiz',(req,res) => {
    Quiz.find({teacher : req.session.user.name},function(err,db){
        if(err)
            res.json('Error');
        res.json(db);
    })
})

const listFromQuizName = (name) => {
    return new Promise((resolve,reject) => {
        StudentQuiz.find({quiz : name},function(err,db){
            if(err) return reject(err);
            return resolve(db);
    })
    })
}

const getStudentfromId = (id) => {
    return new Promise((resolve,reject) => {
        Student.find({_id : id},function(err,db){
            if(err) reject(err);
            resolve(db);
        })
    })
}

const getAllStudents = (result) => {
    var ctr = 0,stdName = [];
    return new Promise((resolve,reject) => {
        result.forEach(cur => {
            Student.find({_id : cur.student},function(err,db){
                if(err) reject(err);
                stdName.push(db[0].name);
                ctr++;
                if(ctr == result.length)
                {
                    resolve(stdName);
                }
            })
        })
    })
}

router.get('/getListofStudents',(req,res) => {
    var initScore;
    console.log(req.query);
    getNameFromId(req.query.q)
    .then(result => {
        return listFromQuizName(result);
    })
    .then(result => {
        console.log(result);
        initScore = result;
        return getAllStudents(result);
    })
    .then(result => {
        var finalArr =[];
        result.forEach((cur,index) => {
            var obj = {
                name : cur,
                score : initScore[index]
            }
            finalArr.push(obj);
        })
        res.render('studentlist',{obj : finalArr});
    })
})


module.exports = router;