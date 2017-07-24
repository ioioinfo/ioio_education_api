// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "4s_mp service";
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
        //查询班级
        {
            method: "GET",
            path: '/get_classes',
            handler: function(request, reply) {

                var ep =  eventproxy.create("rows", "plans", "teachers", "grades",
					function(rows, plans, teachers, grades){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                row.plan = plans[row.plan_id];
                            }
                            if (teachers[row.master_id]) {
                                row.master = teachers[row.master_id];
                            }
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询所有班级
                server.plugins['models'].classes.get_classes(function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
                //查询所有计划
                server.plugins['models'].lesson_plans.get_lesson_plans(function(err,rows){
                    if (!err) {
                        var plans_map = {};
						for (var i = 0; i < rows.length; i++) {
							plans_map[rows[i].id] = rows[i];
						}
						ep.emit("plans", plans_map);
					}else {
						ep.emit("plans", {});
					}
				});
                //查询所有老师
                server.plugins['models'].teachers.get_teachers(function(err,rows){
                    if (!err) {
                        var teachers_map = {};
						for (var i = 0; i < rows.length; i++) {
							teachers_map[rows[i].id] = rows[i];
						}
						ep.emit("teachers", teachers_map);
					}else {
						ep.emit("teachers", {});
					}
				});
                //查询所有年级
                server.plugins['models'].grade_levels.get_grades(function(err,rows){
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
        //创建班级
		{
			method: 'POST',
			path: '/save_class',
			handler: function(request, reply){
                var clas = request.payload.clas;
                clas = JSON.parse(clas);
                if (!clas.plan_id || !clas.name || !clas.code ||!clas.state || !clas.starting_date || !clas.end_date || !clas.class_master
                || !clas.master_id || !clas.remarks || !clas.level_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var plan_id = clas.plan_id;
                var name = clas.name;
                var code = clas.code;
                var state = clas.state;
                var starting_date = clas.starting_date;
                var end_date = clas.end_date;
                var class_master = clas.class_master;
                var master_id = clas.master_id;
                var remarks = clas.remarks;
                var level_id = clas.level_id;

				server.plugins['models'].classes.save_class(plan_id, name, code, state, starting_date, end_date, class_master, master_id, remarks, level_id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
        //更新班级
        {
            method: 'POST',
            path: '/update_class',
            handler: function(request, reply){
                var clas = request.payload.clas;
                clas = JSON.parse(clas);
                if (!clas.plan_id || !clas.name || !clas.code ||!clas.state || !clas.starting_date || !clas.end_date || !clas.class_master
                || !clas.master_id || !clas.remarks || !clas.level_id || !clas.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var id = clas.id;
                var plan_id = clas.plan_id;
                var name = clas.name;
                var code = clas.code;
                var state = clas.state;
                var starting_date = clas.starting_date;
                var end_date = clas.end_date;
                var class_master = clas.class_master;
                var master_id = clas.master_id;
                var remarks = clas.remarks;
                var level_id = clas.level_id;

                server.plugins['models'].classes.update_class(id, plan_id, name, code, state, starting_date, end_date, class_master, master_id, remarks, level_id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //查询班级
        {
            method: "GET",
            path: '/search_class_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                var ep =  eventproxy.create("rows", "plans", "teachers", "grades",
                    function(rows, plans, teachers, grades){

                    return reply({"success":true,"rows":rows,"grades":grades,"plans":plans,"teachers":teachers,"service_info":service_info});
                });
                //查询所有班级
                server.plugins['models'].classes.search_class_byId(id, function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                //查询所有计划
                server.plugins['models'].lesson_plans.get_lesson_plans(function(err,rows){
                    if (!err) {
                        ep.emit("plans", rows);
                    }else {
                        ep.emit("plans", []);
                    }
                });
                //查询所有老师
                server.plugins['models'].teachers.get_teachers(function(err,rows){
                    if (!err) {
                        ep.emit("teachers", rows);
                    }else {
                        ep.emit("teachers", []);
                    }
                });
                //查询所有年级
                server.plugins['models'].grade_levels.get_grades(function(err,rows){
                    if (!err) {
                        ep.emit("grades", err);
                    }else {
                        ep.emit("grades", []);
                    }
                });
            }
        },
        //删除班级
        {
            method: 'POST',
            path: '/delete_class',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].classes.delete_class(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //班级添加学员
        {
			method: 'POST',
			path: '/add_students',
			handler: function(request, reply){
                var class_id = request.payload.class_id;
                var student_ids = request.payload.student_ids;
                student_ids = JSON.parse(student_ids);

                if (!class_id || student_ids.length==0) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var save_fail = [];
				var save_success = [];
                async.each(student_ids, function(student_id, cb) {
                    server.plugins['models'].classes_infos.add_students(class_id,student_id,function(err,result){
    					if (result.affectedRows>0) {
                            save_success.push(student_id);
                            cb();
    					}else {
                            console.log(content.message);
                            save_fail.push(invent);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });
			}
		},

    ]);

    next();
}

exports.register.attributes = {
    name: "education_controller"
};
