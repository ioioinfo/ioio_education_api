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
		//查询反馈列表
        {
            method: "GET",
            path: '/get_feedbacks',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "students",
					function(rows, num, students){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].feedbacks.get_feedbacks(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].feedbacks.account_feedbacks(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
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
		//id查询反馈
        {
            method: "GET",
            path: '/search_feedback_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "students",
					function(rows, students){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (students[row.student_id]) {
                                row.student = students[row.student_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询
                server.plugins['models'].feedbacks.search_feedback_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
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
		//删除
		{
			method: 'POST',
			path: '/delete_feedback',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].feedbacks.delete_feedback(id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
		//新增反馈
		{
			method: 'POST',
			path: '/save_feedback',
			handler: function(request, reply){
				var feedback = request.payload.feedback;
                feedback = JSON.parse(feedback);
                if (!feedback.student_id || !feedback.student_name ||
    			!feedback.feedback_person || !feedback.feedback_content ||
    			!feedback.state || !feedback.feedback_date) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                // feedback = {
                //     "student_id":2,
                //     "student_name":"小可爱",
                //     "feedback_person":"李青",
                //     "feedback_content":"学生进步很快",
                //     "state":"已反馈",
                //     "feedback_date":"2017-07-30"
                // }

				server.plugins['models'].feedbacks.save_feedback(feedback, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
		//更新反馈
		{
			method: 'POST',
			path: '/update_feedback',
			handler: function(request, reply){
                var feedback = request.payload.feedback;
                feedback = JSON.parse(feedback);
                if (!feedback.student_id || !feedback.student_name ||
    			!feedback.feedback_person || !feedback.feedback_content ||
    			!feedback.state || !feedback.feedback_date || !feedback.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

				server.plugins['models'].feedbacks.update_feedback(feedback, function(err,result){
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
    name: "feedbacks_controller"
};
