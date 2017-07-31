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
		//查询学习任务列表
        {
            method: "GET",
            path: '/get_learning_tasks',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
                var info2 = {};
                var ep =  eventproxy.create("rows", "plans", "grades",
                "num", "classes", "students", "lessons", function(rows, plans, grades,
                    num, classes, students, lessons){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                row.plan = plans[row.plan_id];
								row.plan_name = plans[row.plan_id].name;
                            }
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
								row.level_name = grades[row.level_id].name;
                            }
                            if (classes[row.class_id]) {
                                row.class = classes[row.class_id];
								row.class_name = classes[row.class_id].name;
                            }
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
                            }
                            if (lessons[row.lesson_id]) {
                                row.lessons = lessons[row.lesson_id];
								row.lessons_name = lessons[row.lesson_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有任务
                server.plugins['models'].learning_task.get_learning_tasks(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].learning_task.account_tasks(info,function(err,rows){
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
                //查询所有学生
                server.plugins['models'].students.get_students(info2,function(err,rows){
                    if (!err) {
                        var students_map = {};
						for (var i = 0; i < rows.length; i++) {
							students_map[rows[i].id] = rows[i];
						}
						ep.emit("students", students_map);
					}else {
						ep.emit("students", {});
					}
				});
                //查询所有课程
                server.plugins['models'].lessons.get_lessons(info2,function(err,rows){
                    if (!err) {
                        var lessons_map = {};
						for (var i = 0; i < rows.length; i++) {
							lessons_map[rows[i].id] = rows[i];
						}
						ep.emit("lessons", lessons_map);
					}else {
						ep.emit("lessons", {});
					}
				});
                //查询所有计划
                server.plugins['models'].lesson_plans.get_lesson_plans(info2,function(err,rows){
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
		//查询学习任务
        {
            method: "GET",
            path: '/search_task_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				console.log(id);
				var info2 = {};
                var ep =  eventproxy.create("rows", "plans", "grades",
                 "classes", "students", "lessons", function(rows, plans, grades,
                    classes, students, lessons){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                row.plan = plans[row.plan_id];
                            }
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                            if (classes[row.class_id]) {
                                row.class = classes[row.class_id];
                            }
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
                            }
                            if (lessons[row.lesson_id]) {
                                row.lessons = lessons[row.lesson_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询任务
                server.plugins['models'].learning_task.search_task_byId(id,function(err,rows){
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
						ep.emit("classes", classes_map);
					}else {
						ep.emit("classes", {});
					}
				});
                //查询所有学生
                server.plugins['models'].students.get_students(info2,function(err,rows){
                    if (!err) {
                        var students_map = {};
						for (var i = 0; i < rows.length; i++) {
							students_map[rows[i].id] = rows[i];
						}
						ep.emit("students", students_map);
					}else {
						ep.emit("students", {});
					}
				});
                //查询所有课程
                server.plugins['models'].lessons.get_lessons(info2,function(err,rows){
                    if (!err) {
                        var lessons_map = {};
						for (var i = 0; i < rows.length; i++) {
							lessons_map[rows[i].id] = rows[i];
						}
						ep.emit("lessons", lessons_map);
					}else {
						ep.emit("lessons", {});
					}
				});
                //查询所有计划
                server.plugins['models'].lesson_plans.get_lesson_plans(info2,function(err,rows){
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
		//删除
		{
			method: 'POST',
			path: '/delete_task',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].learning_task.delete_task(id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
		//新增学习任务
		{
			method: 'POST',
			path: '/save_learning_task',
			handler: function(request, reply){
				var student_id = request.payload.student_id;
				var class_id = request.payload.class_id;
				var plan_id = request.payload.plan_id;
				var lesson_id = request.payload.lesson_id;
				var level_id = request.payload.level_id;
				var total_hours = request.payload.total_hours;

				if (!student_id || !class_id || !plan_id || !level_id || !lesson_id || !total_hours) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].learning_task.save_learning_task(student_id, class_id, plan_id, lesson_id, level_id, total_hours, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
		//更新学习任务
		{
			method: 'POST',
			path: '/update_learning_task',
			handler: function(request, reply){

				var id = request.payload.id;
				var current_hours = request.payload.current_hours;
				var lesson_id = request.payload.lesson_id;
				var progress_rate = 0;
				var state = "";


				if (!id || !current_hours || !lesson_id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].lessons.search_lesson_byId(lesson_id, function(err,rows){
					if (!err) {
						var total_hours = rows[0].hours;
						progress_rate = (current_hours/total_hours).toFixed(2);
						if (progress_rate>= 1) {
							state = "已完成";
						}else if (progress_rate>0) {
							state = "进行中";
						}
						server.plugins['models'].learning_task.update_learning_task(id, state, progress_rate, current_hours, function(err,result){
							if (result.affectedRows>0) {
								return reply({"success":true,"service_info":service_info});
							}else {
								return reply({"success":false,"message":result.message,"service_info":service_info});
							}
						});

					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});

			}
		},
		//查询学习记录列表
		{
			method: "GET",
			path: '/get_learning_records',
			handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
				var ep =  eventproxy.create("rows", "plans", "grades",
				"num", "classes", "students", "lessons", function(rows, plans, grades,
					num, classes, students, lessons){
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							if (plans[row.plan_id]) {
								row.plan = plans[row.plan_id];
								row.plan_name = plans[row.plan_id].name;
							}
							if (grades[row.level_id]) {
								row.level = grades[row.level_id];
								row.level_name = grades[row.level_id].name;
							}
							if (classes[row.class_id]) {
								row.class = classes[row.class_id];
								row.class_name = classes[row.class_id].name;
							}
							if (students[row.student_id]) {
								row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
							}
							if (lessons[row.lesson_id]) {
								row.lessons = lessons[row.lesson_id];
								row.lesson_name = lessons[row.lesson_id].name;
							}
						}
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
				//查询所有任务
				server.plugins['models'].learning_records.get_learning_records(info,function(err,rows){
					if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].learning_records.account_learning_records(info,function(err,rows){
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
				//查询所有学生
				server.plugins['models'].students.get_students(info2,function(err,rows){
					if (!err) {
						var students_map = {};
						for (var i = 0; i < rows.length; i++) {
							students_map[rows[i].id] = rows[i];
						}
						ep.emit("students", students_map);
					}else {
						ep.emit("students", {});
					}
				});
				//查询所有课程
				server.plugins['models'].lessons.get_lessons(info2,function(err,rows){
					if (!err) {
						var lessons_map = {};
						for (var i = 0; i < rows.length; i++) {
							lessons_map[rows[i].id] = rows[i];
						}
						ep.emit("lessons", lessons_map);
					}else {
						ep.emit("lessons", {});
					}
				});
				//查询所有计划
				server.plugins['models'].lesson_plans.get_lesson_plans(info2,function(err,rows){
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
		//查询学习记录
		{
			method: "GET",
			path: '/search_learning_record_byId',
			handler: function(request, reply) {
				var id = request.query.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}
				console.log(id);
				var info2 = {};
				var ep =  eventproxy.create("rows", "plans", "grades",
				 "classes", "students", "lessons", function(rows, plans, grades,
					classes, students, lessons){
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							if (plans[row.plan_id]) {
								row.plan = plans[row.plan_id];
							}
							if (grades[row.level_id]) {
								row.level = grades[row.level_id];
							}
							if (classes[row.class_id]) {
								row.class = classes[row.class_id];
							}
							if (students[row.student_id]) {
								row.student = students[row.student_id];
							}
							if (lessons[row.lesson_id]) {
								row.lessons = lessons[row.lesson_id];
							}
						}
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
				//查询任务
				server.plugins['models'].learning_records.search_learning_record_byId(id,function(err,rows){
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
						ep.emit("classes", classes_map);
					}else {
						ep.emit("classes", {});
					}
				});
				//查询所有学生
				server.plugins['models'].students.get_students(info2,function(err,rows){
					if (!err) {
						var students_map = {};
						for (var i = 0; i < rows.length; i++) {
							students_map[rows[i].id] = rows[i];
						}
						ep.emit("students", students_map);
					}else {
						ep.emit("students", {});
					}
				});
				//查询所有课程
				server.plugins['models'].lessons.get_lessons(info2,function(err,rows){
					if (!err) {
						var lessons_map = {};
						for (var i = 0; i < rows.length; i++) {
							lessons_map[rows[i].id] = rows[i];
						}
						ep.emit("lessons", lessons_map);
					}else {
						ep.emit("lessons", {});
					}
				});
				//查询所有计划
				server.plugins['models'].lesson_plans.get_lesson_plans(info2,function(err,rows){
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
		//新增学习任务
		{
			method: 'POST',
			path: '/save_learning_record',
			handler: function(request, reply){
				var learning_record = request.payload.learning_record;
				learning_record = JSON.parse(learning_record);

				// learning_record = {
				// 	"student_id":1,
				// 	"class_id":1,
				// 	"plan_id":1,
				// 	"level_id":1,
				// 	"lesson_id":1,
				// 	"hours":2,
				// 	"starting_date":"2017-07-30",
				// 	"end_date":"2017-07-30"
				// };

				if (!learning_record.student_id || !learning_record.class_id || !learning_record.plan_id || !learning_record.level_id || !learning_record.lesson_id || !learning_record.hours || !learning_record.starting_date || !learning_record.end_date) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].learning_records.save_learning_record(learning_record, function(err,result){
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
    name: "learning_task_controller"
};
