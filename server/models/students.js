var _ = require('lodash');
var EventProxy = require('eventproxy');

var students = function(server) {
	return {
		//获得所有学员
		get_students : function(info,cb){
            var query = `select id, name, code, age, sex, phone, state, address, province,  city, district, photo, level_id, created_at, updated_at, flag
            from students where flag = 0
            `;
			if (info.thisPage) {
                var offset = info.thisPage-1;
                if (info.everyNum) {
                    query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
                }else {
                    query = query + " limit " + offset*20 + ",20";
                }
            }
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		account_students : function(info,cb){
            var query = `select count(1) num
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
			var coloums = [student.name, student.code, student.age, student.sex, student.phone, student.state, student.address, student.province, student.city, student.district, student.photo, student.level_id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//学员删除
		delete_student:function(id, cb){
			var query = `update students set flag = 1, updated_at = now()
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
		//id查询学员
		search_student_byId : function(id, cb){
			var query = `select id, name, code, age, sex, phone, state, address, province,  city, district, photo, level_id, created_at, updated_at, flag
			from students where flag = 0 and id = ?
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
		//更新信息
		update_student:function(id, name, code, age, sex, phone, state, address, province,  city, district, photo, level_id, cb){
			var query = `update students set name = ?, code = ?, age = ?, sex = ?,
			phone = ?, state = ?, address = ?, province = ?, city = ?, district = ?,
			photo = ?, level_id = ?, updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [name, code, age, sex, phone, state, address, province,
				city, district, photo, level_id, id];
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
