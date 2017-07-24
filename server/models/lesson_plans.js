var _ = require('lodash');
var EventProxy = require('eventproxy');

var lesson_plans = function(server) {
	return {
		search_plan_byId : function(id, cb){
            var query = `select id, name, code, created_at, updated_at, flag
            from lesson_plans where id = ? and flag =0
            `;
            server.plugins['mysql'].query(query, [id], function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

		get_lesson_plans : function(cb){
            var query = `select id, name, code, created_at, updated_at, flag
            from lesson_plans where flag = 0
            `;
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

	};
};

module.exports = lesson_plans;
