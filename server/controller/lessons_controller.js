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
		//查询课程
        {
            method: "GET",
            path: '/get_lessons',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
                var ep =  eventproxy.create("rows", "plans", "teachers", "grades", "num",
					function(rows, plans, teachers, grades, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                row.plan = plans[row.plan_id];
                            }
                            if (teachers[row.teacher_id]) {
                                row.teacher = teachers[row.teacher_id];
                            }
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].lessons.get_lessons(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].lessons.account_lessons(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
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
		//查询课程
        {
            method: "GET",
            path: '/search_lesson_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var ep =  eventproxy.create("rows", "plans", "teachers", "grades",
					function(rows, plans, teachers, grades){

					return reply({"success":true,"rows":rows,"grades":grades,"plans":plans,"teachers":teachers,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].lessons.search_lesson_byId(id,function(err,rows){
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
		//删除
		{
			method: 'POST',
			path: '/delete_lesson',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].lessons.delete_lesson(id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
		//新增计划
		{
			method: 'POST',
			path: '/save_lesson',
			handler: function(request, reply){
				var plan_id = request.payload.plan_id;
				var teacher_id = request.payload.teacher_id;
				var name = request.payload.name;
				var code = request.payload.code;
				var hours = request.payload.hours;
				var level_id = request.payload.level_id;

				if (!plan_id || !teacher_id || !name || !code || !hours || !level_id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].lessons.save_lesson(plan_id, teacher_id, name, code, hours, level_id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
		//更新课程信息
		{
			method: 'POST',
			path: '/update_lesson',
			handler: function(request, reply){
				var id = request.payload.id;
				var plan_id = request.payload.plan_id;
				var teacher_id = request.payload.teacher_id;
				var name = request.payload.name;
				var code = request.payload.code;
				var hours = request.payload.hours;
				var level_id = request.payload.level_id;
				if (!id || !teacher_id || !name || !code || !hours || !level_id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].lessons.update_lesson(id, plan_id, teacher_id, name, code, hours, level_id, function(err,result){
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
    name: "lessons_controller"
};
