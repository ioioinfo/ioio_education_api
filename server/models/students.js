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
		// 保存学员
		save_student : function(student, cb){
			var query = `insert into students (name, code, age, sex, phone, state, address, province, city, district, photo, level_id, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, ?, ?, ?,
			?, ?, ?, ?, ?, now(), now(), 0
			)
			`;
			console.log("query:"+query);
			var coloums = [student.name, student.code, student.age, student.sex, student.phone, student.state, student.address, student.province, student.city, student.district, student.photo, student.level_id];
			console.log("coloums:"+coloums);
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

module.exports = students;
