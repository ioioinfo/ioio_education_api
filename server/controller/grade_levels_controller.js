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
		//查询年级
        {
            method: "GET",
            path: '/get_grades',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "teachers", "num",
					function(rows, teachers, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (teachers[row.leader_id]) {
                                row.leader = teachers[row.leader_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].grade_levels.get_grades(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].grade_levels.account_grades(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
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
		//id查询年级
        {
            method: "GET",
            path: '/search_grade_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "teachers",
					function(rows, teachers){

					return reply({"success":true,"rows":rows,"teachers":teachers,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].lessons.search_lesson_byId(id,function(err,rows){
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

            }
        },
		//删除
		{
			method: 'POST',
			path: '/delete_grade',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].grade_levels.delete_grade(id, function(err,result){
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
			path: '/save_grade',
			handler: function(request, reply){
				var name = request.payload.name;
				var code = request.payload.code;
				var grade_leader = request.payload.grade_leader;
				var leader_id = request.payload.leader_id;
				var state = request.payload.state;
				var remark = request.payload.remark;

				if (!name || !code || !grade_leader || !leader_id || !state || !remark) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].grade_levels.save_grade(name, code, grade_leader, leader_id, state, remark, function(err,result){
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
			path: '/update_grade',
			handler: function(request, reply){
				var id = request.payload.id;
                var name = request.payload.name;
				var code = request.payload.code;
				var grade_leader = request.payload.grade_leader;
				var leader_id = request.payload.leader_id;
				var state = request.payload.state;
				var remark = request.payload.remark;

				if (!name || !code || !grade_leader || !leader_id || !state || !remark || !id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].grade_levels.update_grade(id, name, code, grade_leader, leader_id, state, remark, function(err,result){
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
    name: "grade_levels_controller"
};
