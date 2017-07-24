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
		// 保存老师
		save_teacher : function(teacher, cb){
			var query = `insert into teachers (name, code, age, sex, phone, state, address, province, city, district, photo, type_id, created_at, updated_at, flag,
			is_master, is_leader)
			values
			(?, ?, ?, ?, ?, ?, ?,
			?, ?, ?, ?, ?, now(), now(), 0,
			?, ?
			)
			`;
			var coloums = [teacher.name, teacher.code, teacher.age, teacher.sex, teacher.phone, teacher.state, teacher.address, teacher.province, teacher.city, teacher.district, teacher.photo, teacher.type_id, teacher.is_master,
			teacher.is_leader];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//老师删除
		delete_teacher:function(id, cb){
			var query = `update teachers set flag = 1, updated_at = now()
				where id = ?
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
	};
};

module.exports = teachers;
