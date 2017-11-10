var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');

var driving_students = function(server) {
	return {
		//获得注册学员
		get_driving_students : function(info,cb){
            var query = `select id, fleet_code, name, identification, phone, origin, car_plate, coach_name, car_type, is_waitijian, contract_number, exam_pay, remark, sex, address, created_at, updated_at, flag
            from driving_students where flag = 0
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
		account_driving_students : function(info,cb){
            var query = `select count(1) num
            from driving_students where flag = 0
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
		// 保存注册学员
		save_driving_student : function(student, cb){
			var query = `insert into driving_students (id, fleet_code, name, identification, phone, origin, car_plate, coach_name, car_type, is_waitijian, contract_number, exam_pay, remark,
            sex, address, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
            var id = uuidV1();
			var coloums = [id, student.fleet_code, student.name, student.identification, student.phone, student.origin, student.car_plate, student.coach_name, student.car_type, student.is_waitijian, student.contract_number, student.exam_pay, student.remark,
            student.sex, student.address];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//注册学员删除
		delete_driving_student:function(id, cb){
			var query = `update driving_students set flag = 1, updated_at = now()
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
		//id查询注册学员
		search_driving_student_by_id : function(id, cb){
			var query = `select id, fleet_code, name, identification, phone, origin, car_plate, coach_name, car_type, is_waitijian, contract_number, exam_pay, remark, sex, address, created_at, updated_at, flag
			from driving_students where flag = 0 and id = ?
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
		//更新注册信息
		update_driving_student:function(student, cb){
			var query = `update driving_students set fleet_code =?, name =?, identification =?, phone =?, origin =?, car_plate =?, coach_name =?, car_type =?, is_waitijian =?, contract_number =?, exam_pay =?, remark =?, sex =?, address =?, updated_at = now()
    		where id = ? and flag =0
			`;
			var coloums = [student.fleet_code, student.name, student.identification, student.phone, student.origin, student.car_plate, student.coach_name, student.car_type, student.is_waitijian, student.contract_number, student.exam_pay, student.remark, student.sex, student.address, student.id];
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

module.exports = driving_students;
