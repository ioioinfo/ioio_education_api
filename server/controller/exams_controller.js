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
        //查询考试
        {
            method: "GET",
            path: '/get_exams',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows","grades","num", "classes", "lessons",
					function(rows, grades, num, classes, lessons){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                            if (classes[row.class_id]) {
                                row.class = classes[row.class_id];
                            }
                            if (lessons[row.lesson_id]) {
                                row.lessons = lessons[row.lesson_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询考试
                server.plugins['models'].exams.get_exams(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].exams.account_exams(info,function(err,rows){
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
            }
        },
        //考试添加
        {
			method: 'POST',
			path: '/save_exam',
			handler: function(request, reply){
                var exam = request.payload.exam;
                exam = JSON.parse(exam);

				if (!exam.name || !exam.code || !exam.level_id || !exam.class_id
                || !exam.lesson_id || !exam.state || !exam.starting_date || !exam.end_date) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].exams.save_exam(exam, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
        //删除考试
        {
            method: 'POST',
            path: '/delete_exam',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                server.plugins['models'].exams.delete_exam(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //根据id查询考试
        {
            method: "GET",
            path: '/search_exam_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "grades", "classes", "lessons",
                    function(rows, grades, classes, lessons){
						for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                            if (classes[row.class_id]) {
                                row.class = classes[row.class_id];
                            }
                            if (lessons[row.lesson_id]) {
                                row.lessons = lessons[row.lesson_id];
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询考试
                server.plugins['models'].exams.search_exam_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
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
            }
        },
        //更新考试信息
        {
            method: 'POST',
            path: '/update_exam',
            handler: function(request, reply){
				var exam = request.payload.exam;
                exam = JSON.parse(exam);

				if (!exam.name || !exam.code || !exam.level_id || !exam.class_id
                || !exam.lesson_id || !exam.state || !exam.starting_date || !exam.end_date || !exam.id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

                server.plugins['models'].exams.update_exam(exam, function(err,result){
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
    name: "exams_controller"
};
