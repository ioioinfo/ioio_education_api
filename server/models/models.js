
exports.register = function(server, options, next){

    server.expose('classes', require('./classes.js')(server));
    server.expose('class_infos', require('./class_infos.js')(server));
    server.expose('students', require('./students.js')(server));
    server.expose('teachers', require('./teachers.js')(server));
    server.expose('lesson_plans', require('./lesson_plans.js')(server));
    server.expose('lessons', require('./lessons.js')(server));
    server.expose('learning_task', require('./learning_task.js')(server));
    server.expose('learning_record', require('./learning_record.js')(server));
    server.expose('dicussions', require('./dicussions.js')(server));
    server.expose('feedbacks', require('./feedbacks.js')(server));


  next();
}

exports.register.attributes = {
    name: 'models'
};
