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
        //查询考试记录
        {
            method: "GET",
            path: '/get_exams_records',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows","exams","num", "students",
					function(rows, exams, num, students){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (exams[row.exam_id]) {
                                row.exam = exams[row.exam_id];
								row.exam_name = exams[row.exam_id].name;
                            }
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询考试记录
                server.plugins['models'].exams_records.get_exams_records(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].exams_records.account_exams_records(info,function(err,rows){
					if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                //查询所有考试
                server.plugins['models'].exams.get_exams(info2,function(err,rows){
                    if (!err) {
                        var exams_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            exams_map[rows[i].id] = rows[i];
                        }
                        ep.emit("exams", exams_map);
                    }else {
                        ep.emit("exams", {});
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

            }
        },
        //考试记录添加
        {
			method: 'POST',
			path: '/save_exam_record',
			handler: function(request, reply){
                var exam_record = request.payload.exam_record;
                exam_record = JSON.parse(exam_record);

                // exam_record = {
                //     "exam_id" : 1,
                //     "student_id": 1,
                //     "state": "已完成",
                //     "score": 88
                // }

				if (!exam_record.exam_id || !exam_record.student_id || !exam_record.state || !exam_record.score) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].exams_records.save_exam_record(exam_record, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
        //删除考试记录
        {
            method: 'POST',
            path: '/delete_exam_record',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                server.plugins['models'].exams_records.delete_exam_record(id, function(err,result){
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
            path: '/search_record_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "exams", "students",
                    function(rows, exams, students){
						for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (exams[row.exam_id]) {
                                row.exam = exams[row.exam_id];
								row.exam_name = exams[row.exam_id].name;
                            }
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询考试记录
                server.plugins['models'].exams_records.search_record_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
                //查询所有考试
                server.plugins['models'].exams.get_exams(info2,function(err,rows){
                    if (!err) {
                        var exams_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            exams_map[rows[i].id] = rows[i];
                        }
                        ep.emit("exams", exams_map);
                    }else {
                        ep.emit("exams", {});
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
            }
        },
        //更新考试信息
        {
            method: 'POST',
            path: '/update_exam_record',
            handler: function(request, reply){
                var exam_record = request.payload.exam_record;
                exam_record = JSON.parse(exam_record);

				if (!exam_record.exam_id || !exam_record.student_id || !exam_record.state || !exam_record.score || !exam_record.id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}
                server.plugins['models'].exams_records.update_exam_record(exam_record, function(err,result){
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
			path: '/search_record_by_student',
			handler: function(request, reply) {
				var student_id = request.query.student_id;
				if (!student_id) {
					return reply({"success":false,"message":"student_id null","service_info":service_info});
				}
				var info2 = {};
				var ep =  eventproxy.create("rows", "exams", "students",
					function(rows, exams, students){
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							if (exams[row.exam_id]) {
								row.exam = exams[row.exam_id];
								row.exam_name = exams[row.exam_id].name;
							}
							if (students[row.student_id]) {
								row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
							}
						}
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
				//查询考试记录
				server.plugins['models'].exams_records.search_record_by_student(student_id,function(err,rows){
					if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询所有考试
				server.plugins['models'].exams.get_exams(info2,function(err,rows){
					if (!err) {
						var exams_map = {};
						for (var i = 0; i < rows.length; i++) {
							exams_map[rows[i].id] = rows[i];
						}
						ep.emit("exams", exams_map);
					}else {
						ep.emit("exams", {});
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
			}
		},


    ]);

    next();
}

exports.register.attributes = {
    name: "exams_records_controller"
};
