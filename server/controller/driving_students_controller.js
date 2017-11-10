// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "edication service";
var async = require('async');

var do_get_method = function(url,cb){
	uu_request.get(url, function(err, response, body){
		if (!err && response.statusCode === 200) {
			var content = JSON.parse(body);
			do_result(false, content, cb);
		} else {
			cb(true, null);
		}
	});
};
//所有post调用接口方法
var do_post_method = function(url,data,cb){
	uu_request.request(url, data, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			do_result(false, body, cb);
		} else {
			cb(true,null);
		}
	});
};
//处理结果
var do_result = function(err,result,cb){
	if (!err) {
		if (result.success) {
			cb(false,result);
		}else {
			cb(true,result);
		}
	}else {
		cb(true,null);
	}
};
exports.register = function(server, options, next) {

    server.route([
        //查询注册学员列表
        {
            method: "GET",
            path: '/get_driving_students',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows", "num",
					function(rows, num){

					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询学员
                server.plugins['models'].driving_students.get_driving_students(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询学员数量
                server.plugins['models'].driving_students.account_driving_students(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
            }
        },
        //注册学员添加，批量
        {
			method: 'POST',
			path: '/save_driving_student',
			handler: function(request, reply){
                var students = request.payload.students;
                students = JSON.parse(students);
                if (students.length==0) {
                    return reply({"success":false,"message":"students wrong","service_info":service_info});
                }
                // var student = {
                //     "fleet_code" : "A",
                //     "name" : "孙楠",
                //     "identification" : "310226199103023322",
                //     "origin" : "光明",
                //     "phone" : "18221036881",
                //     "car_plate" : "C沪E701232",
                //     "coach_name" : "郑东方",
                //     "car_type" : "C1",
                //     "is_waitijian" : "是",
                //     "contract_number" : "郑东方",
                //     "exam_pay" : 1200,
                //     "remark" : "没有",
                //     "sex" : "男",
                //     "address" : "浦南路1005弄201"
                // };
                // var students = [];
                // students.push(student);
                var save_fail = [];
				var save_success = [];
                async.each(students, function(student, cb) {
                    server.plugins['models'].driving_students.save_driving_student(student,function(err,result){
    					if (result.affectedRows>0) {
                            save_success.push(student.name);
                            cb();
    					}else {
                            console.log(result.message);
                            save_fail.push(student.name);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });
			}
		},
        //删除注册学员
        {
            method: 'POST',
            path: '/delete_driving_student',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].driving_students.delete_driving_student(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //根据id查注册学员
        {
            method: "GET",
            path: '/search_driving_student_by_id',
            handler: function(request, reply) {
                var id = request.query.id;
				if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows",
					function(rows){
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询学员
                server.plugins['models'].driving_students.search_driving_student_by_id(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
            }
        },
        //更新注册学员信息
        {
            method: 'POST',
            path: '/update_driving_student',
            handler: function(request, reply){
                var student = request.payload.student;
                student = JSON.parse(student);
                if (!student.id || !student.fleet_code || !student.name || !student.identification || !student.phone || !student.origin || !student.car_plate || !student.coach_name || !student.car_type || !student.is_waitijian || !student.contract_number || !student.exam_pay || !student.remark || !student.sex || !student.address) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var student = {
                //     "id":"6d7832b0-c5f6-11e7-9623-5b8df182927b",
                //     "fleet_code" : "A",
                //     "name" : "孙楠2",
                //     "identification" : "310226199103023322",
                //     "origin" : "光明",
                //     "phone" : "18221036881",
                //     "car_plate" : "C沪E701232",
                //     "coach_name" : "郑方",
                //     "car_type" : "C1",
                //     "is_waitijian" : "是",
                //     "contract_number" : "郑东方",
                //     "exam_pay" : 1200,
                //     "remark" : "没有",
                //     "sex" : "男",
                //     "address" : "浦南路1005弄201"
                // };
                server.plugins['models'].driving_students.update_driving_student(student, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },

    ]);

    next();
}

exports.register.attributes = {
    name: "driving_students_controller"
};
