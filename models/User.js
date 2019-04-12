var mongoose = require('mongoose');

var studentSchema = mongoose.Schema(
    {
        person : String,
        name : String,
        password : String,
        email : String
    }
)

var teacherSchema = mongoose.Schema(
    {
        person : String,
        name : String,
        password : String,
        email : String
    }
)

module.exports = 
{
    Student : mongoose.model('Student',studentSchema),
    Teacher : mongoose.model('Teacher',teacherSchema)
}
