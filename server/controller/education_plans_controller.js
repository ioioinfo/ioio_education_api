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
		//查询计划
        {
            method: "GET",
            path: '/get_education_plans',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "classes", "teachers", "num",
					function(rows, classes, teachers, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (classes[row.class_id]) {
                                row.classes = classes[row.class_id];
								row.classes_name = classes[row.class_id].name;
                            }
                            if (teachers[row.teacher_id]) {
                                row.teacher = teachers[row.teacher_id];
								row.teacher_name = teachers[row.teacher_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有计划
                server.plugins['models'].education_plans.get_education_plans(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].education_plans.account_education_plans(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                //查询所有班级
                server.plugins['models'].classes.get_classes(info2,function(err,rows){
                    if (!err) {
                        var classes_map = {};
						for (var i = 0; i < rows.length; i++) {
							classes_map[rows[i].id] = rows[i];
						}
						ep.emit("classes", classes_map);
					}else {
						ep.emit("classes", {});
					}
				});
                //查询所有老师
                server.plugins['models'].teachers.get_teachers(info2,function(err,rows){
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

            }
        },
		//id查询计划
        {
            method: "GET",
            path: '/search_education_plan_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "classes", "teachers",
					function(rows, classes, teachers){

					return reply({"success":true,"rows":rows,"classes":classes,"teachers":teachers,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].education_plans.search_education_plan_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});

                //查询所有老师
                server.plugins['models'].teachers.get_teachers(info2, function(err,rows){
                    if (!err) {
                        ep.emit("teachers", rows);
                    }else {
                        ep.emit("teachers", []);
                    }
                });
                //查询所有班级
                server.plugins['models'].classes.get_classes(info2,function(err,rows){
                    if (!err) {

                        ep.emit("classes", rows);
                    }else {
                        ep.emit("classes", []);
                    }
                });

            }
        },
		//删除
		{
			method: 'POST',
			path: '/delete_education_plan',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].education_plans.delete_education_plan(id, function(err,result){
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
			path: '/save_education_plan',
			handler: function(request, reply){
                var plan = request.payload.plan;
                plan = JSON.parse(plan);
                if (!plan.class_id|| !plan.name || !plan.code|| !plan.hours|| !plan.teacher_id|| !plan.assistant_id ||!plan.subject_id||!plan.starting_date|| !plan.end_date) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                // var plan = {
                //     "class_id":1,
                //     "name":"初一英语",
                //     "code":"001",
                //     "hours":80,
                //     "teacher_id":1,
                //     "assistant_id":1,
                //     "subject_id":1,
                //     "starting_date":"2017-08-03",
                //     "end_date":"2017-08-03"
                // }

				server.plugins['models'].education_plans.save_education_plan(plan, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
		//更新计划
		{
			method: 'POST',
			path: '/update_education_plan',
			handler: function(request, reply){

                var plan = request.payload.plan;
                plan = JSON.parse(plan);

                if (!plan.class_id|| !plan.name || !plan.code|| !plan.hours|| !plan.teacher_id|| !plan.assistant_id ||!plan.subject_id||!plan.starting_date|| !plan.end_date|| !plan.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

				server.plugins['models'].education_plans.update_education_plan(plan, function(err,result){
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
    name: "education_plans_controller"
};
