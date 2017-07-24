var _ = require('lodash');
var EventProxy = require('eventproxy');

var grade_levels = function(server) {
	return {

		get_grades : function(cb){
			var query = `select id, name,  code,  grade_leader,  leader_id,
			state,  remark,   created_at,  updated_at,  flag
			from grade_levels where flag = 0
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

module.exports = grade_levels;
