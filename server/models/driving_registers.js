var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');
var driving_registers = function(server) {
	return {
        //获得注册学员
		get_driving_registers : function(info,cb){
            var query = `select id, certificate_type, certification_number, student_name, skill_number, exam_point, exam_car_type, exam_items, car_plate, coach_identification, coach_name, sex, address, created_at, updated_at, flag
            from driving_registers where flag = 0
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
		account_driving_registers : function(info,cb){
            var query = `select count(1) num
            from driving_registers where flag = 0
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
		save_driving_register : function(register, cb){
			var query = `insert into driving_registers (id, certificate_type, certification_number, student_name, skill_number, exam_point, exam_car_type, exam_items, car_plate, coach_identification, coach_name,
            sex, address, created_at, updated_at, flag )
			values
			(?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
            var id = uuidV1();
			var coloums = [id, register.certificate_type, register.certification_number, register.student_name, register.skill_number, register.exam_point, register.exam_car_type, register.exam_items, register.car_plate, register.coach_identification, register.coach_name, register.sex, register.address];
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
		delete_driving_register:function(id, cb){
			var query = `update driving_registers set flag = 1, updated_at = now()
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
		search_register_by_id : function(id, cb){
			var query = `select id, certificate_type, certification_number, student_name, skill_number, exam_point, exam_car_type, exam_items, car_plate, coach_identification, coach_name, sex, address, created_at, updated_at, flag
			from driving_registers where flag = 0 and id = ?
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
		update_driving_register:function(register, cb){
			var query = `update driving_registers set certificate_type =?, certification_number =?, student_name =?, skill_number =?, exam_point =?, exam_car_type =?, exam_items =?, car_plate =?, coach_identification =?, coach_name =?, sex =?, address =?, updated_at = now()
    		where id = ? and flag =0
			`;
			var coloums = [register.certificate_type, register.certification_number, register.student_name, register.skill_number, register.exam_point, register.exam_car_type, register.exam_items, register.car_plate, register.coach_identification, register.coach_name, register.sex, register.address, register.id];
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

module.exports = driving_registers;
