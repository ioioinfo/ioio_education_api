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
            path: '/get_schedules',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num","plans","times","classes",
					function(rows, num, plans, times, classes){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                // row.plan = plans[row.plan_id];
								row.plan_name = plans[row.plan_id].name;
                            }
                            if (times[row.time_id]) {
                                // row.time = times[row.time_id];
								row.starting_time = times[row.time_id].starting_time;
								row.end_time = times[row.time_id].end_time;
                            }
							if (classes[row.class_id]) {
                                // row.class = classes[row.class_id];
								row.class_name = classes[row.class_id].name;
                            }

                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].schedules.get_schedules(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].schedules.account_schedules(info,function(err,rows){
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

                //查询所有课程
                server.plugins['models'].timetables.get_timetables(info2,function(err,rows){
                    if (!err) {
                        var times_map = {};
						for (var i = 0; i < rows.length; i++) {
							times_map[rows[i].id] = rows[i];
						}
						ep.emit("times", times_map);
					}else {
						ep.emit("times", {});
					}
				});

                //查询所有计划
                server.plugins['models'].education_plans.get_education_plans(info2,function(err,rows){
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

            }
        },
		//查询课程
        {
            method: "GET",
            path: '/search_schedule_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows","plans","times","classes",
					function(rows, plans, times, classes){
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							if (plans[row.plan_id]) {
								// row.plan = plans[row.plan_id];
								row.plan_name = plans[row.plan_id].name;
							}
							if (times[row.time_id]) {
								// row.time = times[row.time_id];
								row.starting_time = times[row.time_id].starting_time;
								row.end_time = times[row.time_id].end_time;
							}
							if (classes[row.class_id]) {
								// row.class = classes[row.class_id];
								row.class_name = classes[row.class_id].name;
							}

						}
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].schedules.search_schedule_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});

				//查询所有班级
                server.plugins['models'].classes.get_classes(info2,function(err,rows){
                    if (!err) {
                        var classes_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            classes_map[rows[i].id] = rows[i];
                        }
						console.log("classes:"+JSON.stringify(classes_map));
                        ep.emit("classes", classes_map);
                    }else {
                        ep.emit("classes", {});
                    }
                });

                //查询所有课程
                server.plugins['models'].timetables.get_timetables(info2,function(err,rows){
                    if (!err) {
                        var times_map = {};
						for (var i = 0; i < rows.length; i++) {
							times_map[rows[i].id] = rows[i];
						}
						ep.emit("times", times_map);
					}else {
						ep.emit("times", {});
					}
				});

                //查询所有计划
                server.plugins['models'].education_plans.get_education_plans(info2,function(err,rows){
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


            }
        },
		//删除
		{
			method: 'POST',
			path: '/delete_schedule',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].schedules.delete_schedule(id, function(err,result){
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
			path: '/save_schedule',
			handler: function(request, reply){
				var schedule = request.payload.schedule;
				schedule = JSON.parse(schedule);

				// var schedule= {
				// 	"name":"补课",
				// 	"plan_id":1,
				// 	"time_id":1,
				// 	"class_id":1,
				// 	"day":"星期六"
				// }

				if (!schedule.name|| !schedule.plan_id||!schedule.time_id|| !schedule.class_id|| !schedule.day) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].schedules.save_schedule(schedule,  function(err,result){
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
			path: '/update_schedule',
			handler: function(request, reply){
				var schedule = request.payload.schedule;
				schedule = JSON.parse(schedule);

				if (!schedule.name|| !schedule.plan_id||!schedule.time_id|| !schedule.class_id|| !schedule.day || !schedule.id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].schedules.update_schedule(schedule,  function(err,result){
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
    name: "schedules_controller"
};
