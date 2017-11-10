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
            path: '/get_driving_registers',
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
                server.plugins['models'].driving_registers.get_driving_registers(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询学员数量
                server.plugins['models'].driving_registers.account_driving_registers(info,function(err,rows){
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
			path: '/save_driving_register',
			handler: function(request, reply){
                var students = request.payload.students;
                students = JSON.parse(students);
                if (students.length==0) {
                    return reply({"success":false,"message":"students wrong","service_info":service_info});
                }
                // var student = {
                //     "certificate_type" : "A",
                //     "certification_number" : "310226199103023322",
                //     "student_name" : "孙楠",
                //     "skill_number" : "310040614080",
                //     "exam_point" : "B331",
                //     "exam_car_type" : "C1",
                //     "exam_items" : "2",
                //     "car_plate" : "沪E701232",
                //     "coach_identification" : "310226199003023321",
                //     "coach_name" : "郑东方",
                //     "sex" : "男",
                //     "address" : "浦南路1005弄201"
                // };
                // var students = [];
                // students.push(student);
                var save_fail = [];
				var save_success = [];
                async.each(students, function(student, cb) {
                    server.plugins['models'].driving_registers.save_driving_register(student,function(err,result){
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
            path: '/delete_driving_register',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].driving_registers.delete_driving_register(id, function(err,result){
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
            path: '/search_register_by_id',
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
                server.plugins['models'].driving_registers.search_register_by_id(id,function(err,rows){
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
            path: '/update_driving_register',
            handler: function(request, reply){
                var student = request.payload.student;
                console.log("student:"+student);
                student = JSON.parse(student);
                if (!student.id || !student.certificate_type || !student.certification_number || !student.student_name || !student.skill_number || !student.exam_point || !student.exam_car_type || !student.exam_items || !student.car_plate || !student.coach_identification || !student.coach_name || !student.sex || !student.address) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var student = {
                //     "id":"5281ce60-c5e9-11e7-8a61-21c0e986d5cc",
                //     "certificate_type" : "A",
                //     "certification_number" : "310226199103023322",
                //     "student_name" : "孙楠",
                //     "skill_number" : "310040614080",
                //     "exam_point" : "B331",
                //     "exam_car_type" : "C2",
                //     "exam_items" : "4",
                //     "car_plate" : "沪E701232",
                //     "coach_identification" : "310226199003023321",
                //     "coach_name" : "郑东方",
                //     "sex" : "男",
                //     "address" : "浦南路1005弄201"
                // };
                server.plugins['models'].driving_registers.update_driving_register(student, function(err,result){
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
    name: "driving_registers_controller"
};
