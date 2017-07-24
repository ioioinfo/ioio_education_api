var _ = require('lodash');
var EventProxy = require('eventproxy');

var classes_infos = function(server) {
	return {
		//添加学员
		add_students : function(class_id, student_id, cb){
    		var query = `insert into classes_infos (class_id, student_id, created_at, updated_at,  flag )
			values
			(?, ?, now(), now(), 0)
            `;
            var coloums = [class_id, student_id];
    		server.plugins['mysql'].query(query, coloums, function(err, results) {
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

module.exports = classes_infos;
