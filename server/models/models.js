
exports.register = function(server, options, next){

    var load_model = function(key, path) {
        var model = require(path)(server);
        if (typeof model.init === 'function') { model.init(); }
        if (typeof model.refresh === 'function') { model.refresh(); }
        server.expose(key, model);
    };

    // load_model('app_function', './app_function.js');


  next();
}

exports.register.attributes = {
    name: 'models'
};
