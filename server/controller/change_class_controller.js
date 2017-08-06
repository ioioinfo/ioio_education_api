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
            path: '/get_change_class_infos',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num","classes","students",
					function(rows, num, classes, students){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (classes[row.class_id1]) {
                                // row.class = classes[row.class_id];
								row.class_name1 = classes[row.class_id1].name;
                            }
                            if (classes[row.class_id2]) {
                                // row.class = classes[row.class_id];
								row.class_name2 = classes[row.class_id2].name;
                            }
                            if (students[row.student_id]) {
                                // row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].change_class_infos.get_change_class_infos(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].change_class_infos.account_change_class_infos(info,function(err,rows){
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

            }
        },
		//查询课程
        {
            method: "GET",
            path: '/search_change_class_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows","class_list","classes","students","students_list",
					function(rows,class_list,classes,students,students_list){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (classes[row.class_id1]) {
                                // row.class = classes[row.class_id];
								row.class_name1 = classes[row.class_id1].name;
                            }
                            if (classes[row.class_id2]) {
                                // row.class = classes[row.class_id];
								row.class_name2 = classes[row.class_id2].name;
                            }
                            if (students[row.student_id]) {
                                // row.student = students[row.student_id];
								row.student_name = students[row.student_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"class_list":class_list,"students_list":students_list,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].change_class_infos.search_change_class_byId(id,function(err,rows){
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
                        ep.emit("class_list", rows);
                    }else {
                        ep.emit("classes", {});
                        ep.emit("class_list", []);
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
                        ep.emit("students_list", rows);
                    }else {
                        ep.emit("students", {});
                        ep.emit("students_list", []);
                    }
                });


            }
        },
		//删除
		{
			method: 'POST',
			path: '/delete_change_class',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].change_class_infos.delete_change_class(id, function(err,result){
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
			path: '/save_change_class_info',
			handler: function(request, reply){
				var change_infos = request.payload.change_infos;
                change_infos = JSON.parse(change_infos);

				if (!change_infos.class_id1 || !change_infos.class_id2 || !change_infos.student_ids.length>0 || !change_infos.type) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

                var save_fail = [];
                var save_success = [];
                async.each(change_infos.student_ids, function(student_id, cb) {
                    var change_info = {
                        "class_id1":change_infos.class_id1,
                        "class_id2":change_infos.class_id2,
                        "student_id":student_id,
                        "type":change_infos.type
                    }
                    server.plugins['models'].change_class_infos.save_change_class_info(change_info,function(err,result){
    					if (result.affectedRows>0) {
                            save_success.push(student_id);
                            cb();
    					}else {
                            console.log(content.message);
                            save_fail.push(student_id);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });

			}
		},
		//更新课程信息
		{
			method: 'POST',
			path: '/update_change_class_info',
			handler: function(request, reply){
                var change_info = request.payload.change_info;
                change_info = JSON.parse(change_info);

				if (!change_info.class_id1 || !change_info.class_id2 || !change_info.student_id || !change_info.type|| !change_info.id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}
                
				server.plugins['models'].change_class_infos.update_change_class_info(change_info, function(err,result){
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
    name: "change_class_controller"
};
