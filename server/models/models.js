
exports.register = function(server, options, next){

    var load_model = function(key, path) {
        var model = require(path)(server);
        if (typeof model.init === 'function') { model.init(); }
        if (typeof model.refresh === 'function') { model.refresh(); }
        server.expose(key, model);
    };

    load_model('classes', './classes.js');
    load_model('class_infos', './class_infos.js');
    load_model('students', './students.js');
    load_model('teachers', './teachers.js');
    load_model('lesson_plans', './lesson_plans.js');
    load_model('lessons', './lessons.js');
    load_model('learning_task', './learning_task.js');
    load_model('learning_record', './learning_record.js');
    load_model('dicussions', './dicussions.js');
    load_model('feedbacks', './feedbacks.js');




  next();
}

exports.register.attributes = {
    name: 'models'
};
