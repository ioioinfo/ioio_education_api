var _ = require('lodash');
var EventProxy = require('eventproxy');

var students = function(server) {
	return {
		//获得所有学员
		get_students : function(cb){
            var query = `select id, name, code, age, sex, phone, state, address, province,  city, district, photo, level_id, created_at, updated_at, flag
            from students where flag = 0
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

module.exports = students;
