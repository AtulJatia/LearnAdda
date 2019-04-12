var mongoose = require('mongoose');
var {Teacher} = require('./User');
var {Student} = require('./User');

var quizSchema = mongoose.Schema({
    quiz_id   : String,
    quiz_name : String,
    question : [String],
    OptionA  : [String],
    OptionB  : [String],
    OptionC  : [String],
    OptionD  : [String],
    Correct  : [String],
    teacher  : String,
    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'Student'
    }]
});

var studentQuizSchema = mongoose.Schema({
    student : 'String',
    quiz : 'String',
    score : Number,
    total : Number
});

module.exports = 
{
    Quiz : mongoose.model('Quiz',quizSchema),
    StudentQuiz : mongoose.model('StudentQuiz',studentQuizSchema)
}