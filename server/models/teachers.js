var _ = require('lodash');
var EventProxy = require('eventproxy');

var teachers = function(server) {
	return {
		get_teachers : function(cb){
            var query = `select id, name, code, age, sex, phone, state, address,
			province, city, district, created_at, photo,  updated_at, flag,
			type_id, is_master, is_leader
            from teachers where flag = 0
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

module.exports = teachers;
