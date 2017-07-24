var _ = require('lodash');
var EventProxy = require('eventproxy');

var classes = function(server) {
	return {
		get_classes : function(cb){
            var query = `select id, plan_id, name, code, state, starting_date, end_date, class_master, master_id, remarks, created_at, updated_at, flag
            from classes where flag = 0
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

module.exports = classes;
