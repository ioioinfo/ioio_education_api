// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "edication service";
var async = require('async');

var day_map = {
	"星期一":{},
	"星期二":{},
	"星期三":{},
	"星期四":{},
	"星期五":{},
	"星期六":{},
	"星期天":{}
};
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
                var ep =  eventproxy.create("rows", "num","plans","times","classes","time",
					function(rows, num, plans, times, classes,time){
						var schedule_map = {};
						var time_map = [];
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
								row.stage = row.starting_time+"-"+row.end_time;
                            }
							if (classes[row.class_id]) {
                                // row.class = classes[row.class_id];
								row.class_name = classes[row.class_id].name;
                            }
							if (day_map[row.day]) {
								schedule_map[row.day] = row;
							}
                        }
						var day_list = ["星期一","星期二","星期三","星期四","星期五","星期六","星期天"]
						for (var i = 0; i < time.length; i++) {
							var ti = time[i];
							var tim = ti.starting_time+"-"+ti.end_time;
							var obj = {"time":tim,"v":{
								"星期一":{},
								"星期二":{},
								"星期三":{},
								"星期四":{},
								"星期五":{},
								"星期六":{},
								"星期天":{}
							}};
							time_map.push(obj);
						}
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							for (var j = 0; j < time_map.length; j++) {
								var time_list = time_map[j];
								if (time_list.time == row.stage) {
									var obj = time_list.v;
									for (var l = 0; l < day_list.length; l++) {
										var one_day = day_list[l];
										if (row.day == one_day) {
											obj[one_day] = row;
											break;
										}
									}
								}
							}
						}

					return reply({"success":true,"time_map":time_map,"service_info":service_info});
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
						ep.emit("time", rows);
					}else {
						ep.emit("times", {});
						ep.emit("time", []);
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
		//更新完整一个班的课程表
		{
			method: 'POST',
			path: '/update_schedules_byClass_id',
			handler: function(request, reply){
				var class_id = request.payload.class_id;
				var subArray = request.payload.subArray;
				subArray = JSON.parse(subArray);
				var schedules_list = [];
				for (var i = 0; i < subArray.length; i++) {
					var sub = subArray[i];
					var time_id = sub.id;
					var schedules = sub.schedules;
					if (schedules.val1 && schedules.val1!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val1,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期一"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val2 && schedules.val2!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val2,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期二"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val3 && schedules.val3!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val3,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期三"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val4 && schedules.val4!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val4,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期四"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val5 && schedules.val5!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val5,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期五"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val6 && schedules.val6!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val6,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期六"
						};
						schedules_list.push(schedule);
					}
					if (schedules.val7 && schedules.val7!="") {
						var schedule = {
							"name":"课程",
							"plan_id":schedules.val7,
							"time_id":time_id,
							"class_id":class_id,
							"day":"星期天"
						};
						schedules_list.push(schedule);
					}
				}

				var save_fail = 0;
				var save_success = [];
                async.each(schedules_list, function(schedule, cb) {
					server.plugins['models'].schedules.save_schedule(schedule,  function(err,result){
						if (result.affectedRows>0) {
							save_success.push(result.insertId);
                            cb();
						}else {
							console.log(result.message);
                            save_fail = save_fail + 1;
                            cb();
						}
					});
                }, function(err) {

					server.plugins['models'].schedules.delete_schedule_byClass_id(
						class_id, save_success, function(err,result){
						if (result.affectedRows>0) {
							return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"fail_num":save_fail});

						}else {
							return reply({"success":false,"message":result.message,"service_info":service_info});
						}
					});

                });


			}
		},



    ]);

    next();
}

exports.register.attributes = {
    name: "schedules_controller"
};
