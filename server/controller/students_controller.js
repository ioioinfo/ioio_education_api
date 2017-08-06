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
        //查询学员列表
        {
            method: "GET",
            path: '/get_students',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows", "grades", "num",
					function(rows, grades, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询学员
                server.plugins['models'].students.get_students(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询学员数量
                server.plugins['models'].students.account_students(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                //查询所有年级
                server.plugins['models'].grade_levels.get_grades(info2,function(err,rows){
                    if (!err) {
                        var grades_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            grades_map[rows[i].id] = rows[i];
                        }
                        ep.emit("grades", grades_map);
                    }else {
                        ep.emit("grades", {});
                    }
                });
            }
        },
        //学员添加，批量
        {
			method: 'POST',
			path: '/save_student',
			handler: function(request, reply){
                var students = request.payload.students;
                students = JSON.parse(students);
                if (students.length==0) {
                    return reply({"success":false,"message":"students wrong","service_info":service_info});
                }

                // var student = {
                //     "name" : "呵呵",
                //     "code" : "002",
                //     "age" : "8岁",
                //     "sex" : "男",
                //     "phone" : "13829839233",
                //     "state" : "已报名",
                //     "address" : "无边大厦",
                //     "province" : "北京",
                //     "city" : "北京",
                //     "district" : "朝阳区",
                //     "photo" : "无",
                //     "level_id" : 1
                // };
                // var students = [];
                // students.push(student);
                var save_fail = [];
				var save_success = [];
                async.each(students, function(student, cb) {
                    server.plugins['models'].students.save_student(student,function(err,result){
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
        //删除班级
        {
            method: 'POST',
            path: '/delete_student',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].students.delete_student(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //根据id查学员
        {
            method: "GET",
            path: '/search_student_byId',
            handler: function(request, reply) {
                var id = request.query.id;
				if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "grades",
					function(rows, grades){
                        // for (var i = 0; i < rows.length; i++) {
                        //     var row = rows[i];
                        //     if (grades[row.level_id]) {
                        //         row.level = grades[row.level_id];
                        //     }
                        // }
					return reply({"success":true,"rows":rows,"grades":grades,"service_info":service_info});
				});
                //查询学员
                server.plugins['models'].students.search_student_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
                //查询所有年级
                server.plugins['models'].grade_levels.get_grades(info2,function(err,rows){
                    if (!err) {

                        ep.emit("grades", rows);
                    }else {
                        ep.emit("grades", []);
                    }
                });
            }
        },
        //更新学员信息
        {
            method: 'POST',
            path: '/update_student',
            handler: function(request, reply){
                var student = request.payload.student;
                student = JSON.parse(student);
                if (!student.id || !student.name || !student.code || !student.age ||        !student.sex || !student.phone || !student.state ||!student.address || !student.province || !student.city || !student.district || !student.photo ||
                !student.level_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var id = student.id;
                var name = student.name;
                var code = student.code;
                var age = student.age;
                var sex = student.sex;
                var phone = student.phone;
                var state = student.state;
                var address = student.address;
                var province = student.province;
                var city = student.city;
                var district = student.district;
                var photo = student.photo;
                var level_id = student.level_id;
                server.plugins['models'].students.update_student(id, name, code,
                    age, sex, phone, state, address, province, city, district, photo, level_id, function(err,result){
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
    name: "students_controller"
};
