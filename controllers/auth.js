var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/elearning',{useNewUrlParser : true});
var {Student} = require('../models/User');
var {Teacher} = require('../models/User');


let registerUser = (data) => {
    console.log("Entered register user");
    var newData = {
        person : data.person,
        name : data.name,
        password : data.password,
        email : data.email
    }
    return new Promise((resolve,reject) => {
        if(data.person == 'student')
        var user = new Student(newData);
        else
        var user = new Teacher(newData);
        console.log(user);
        user.save(function(err,db){
            console.log("Entered database")
            if(err)
            {
                return reject(err);
                console.log(err)
            }
            console.log("DB" ,db);
            return resolve(db);
        });
    })
}

let loginUser = (data) => {
    return new Promise((resolve,reject) => {
        if(data.person == 'student')
        {
        Student.find((data),(err,db) => {
            if(err)
            return reject("err")
            if(db[0] == null)
            return reject("Student not found")
            return resolve(db[0]);
        })}
        else
        {
            Teacher.find((data),(err,db) => {
                if(err)
                return reject("err")
                if(db[0] == null)
                return reject("Teacher not found")
                return resolve(db[0]);
            })
        }
    });
}

module.exports = {
    registerUser : registerUser,
    loginUser : loginUser
}