var _ = require('lodash');
var EventProxy = require('eventproxy');

var classes_infos = function(server) {
	return {
		//添加学员
		add_students : function(class_id, student_id,student_name, cb){
    		var query = `insert into classes_infos (class_id, student_id,student_name, created_at, updated_at,  flag )
			values
			(?, ?, ?, now(), now(), 0)
            `;
            var coloums = [class_id, student_id, student_name];
    		server.plugins['mysql'].query(query, coloums, function(err, results) {
    			if (err) {
    				console.log(err);
    				cb(true,results);
    				return;
    			}
    			cb(false,results);
    		});
    	},
		//查询指定班级学生
		search_students_byId : function(id, cb){
			var query = `select id, class_id, student_id, student_name, created_at, updated_at
			from classes_infos where flag = 0 and class_id = ?
			`;
			server.plugins['mysql'].query(query,[id],function(err, results) {
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
