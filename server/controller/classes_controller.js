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
        //查询班级
        {
            method: "GET",
            path: '/get_classes',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "plans", "teachers", "grades", "num",
					function(rows, plans, teachers, grades, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (plans[row.plan_id]) {
                                row.plan = plans[row.plan_id];
                            }
                            if (teachers[row.master_id]) {
                                row.class_master = teachers[row.master_id].name;
                            }
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有班级
                server.plugins['models'].classes.get_classes(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询所有班级数量
                server.plugins['models'].classes.account_classes(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
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
        //创建班级
		{
			method: 'POST',
			path: '/save_class',
			handler: function(request, reply){
                var clas = request.payload.clas;
                clas = JSON.parse(clas);
                if (!clas.classroom_id || !clas.name || !clas.code ||!clas.state || !clas.starting_date || !clas.end_date || !clas.class_master
                || !clas.master_id || !clas.remarks || !clas.level_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var classroom_id = clas.classroom_id;
                var name = clas.name;
                var code = clas.code;
                var state = clas.state;
                var starting_date = clas.starting_date;
                var end_date = clas.end_date;
                var class_master = clas.class_master;
                var master_id = clas.master_id;
                var remarks = clas.remarks;
                var level_id = clas.level_id;

				server.plugins['models'].classes.save_class(classroom_id, name, code, state, starting_date, end_date, class_master, master_id, remarks, level_id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
        //更新班级
        {
            method: 'POST',
            path: '/update_class',
            handler: function(request, reply){
                var clas = request.payload.clas;
                clas = JSON.parse(clas);
                if (!clas.classroom_id || !clas.name || !clas.code ||!clas.state || !clas.starting_date || !clas.end_date || !clas.class_master
                || !clas.master_id || !clas.remarks || !clas.level_id || !clas.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var id = clas.id;
                var classroom_id = clas.classroom_id;
                var name = clas.name;
                var code = clas.code;
                var state = clas.state;
                var starting_date = clas.starting_date;
                var end_date = clas.end_date;
                var class_master = clas.class_master;
                var master_id = clas.master_id;
                var remarks = clas.remarks;
                var level_id = clas.level_id;

                server.plugins['models'].classes.update_class(id, classroom_id, name, code, state, starting_date, end_date, class_master, master_id, remarks, level_id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //查询班级
        {
            method: "GET",
            path: '/search_class_byId',
            handler: function(request, reply) {
				var info2 = {};
                var id = request.query.id;
                var ep =  eventproxy.create("rows", "plans", "teachers", "grades",
                    function(rows, plans, teachers, grades){

                    return reply({"success":true,"rows":rows,"grades":grades,"plans":plans,"teachers":teachers,"service_info":service_info});
                });
                //查询所有班级
                server.plugins['models'].classes.search_class_byId(id, function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                //查询所有计划
                server.plugins['models'].lesson_plans.get_lesson_plans(info2,function(err,rows){
                    if (!err) {
                        ep.emit("plans", rows);
                    }else {
                        ep.emit("plans", []);
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
                //查询所有年级
                server.plugins['models'].grade_levels.get_grades(info2,function(err,rows){
                    if (!err) {
                        ep.emit("grades", rows);
                    }else {
                        ep.emit("grades", []);
                    }
                });
            }
        },
        //删除班级
        {
            method: 'POST',
            path: '/delete_class',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].classes.delete_class(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //班级添加学员
        {
			method: 'POST',
			path: '/add_students',
			handler: function(request, reply){
                var class_id = request.payload.class_id;
                var student_ids = request.payload.student_ids;
                student_ids = JSON.parse(student_ids);

                if (!class_id || student_ids.length==0) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var save_fail = [];
				var save_success = [];
                async.each(student_ids, function(student_id, cb) {
					server.plugins['models'].students.search_student_byId(student_id,function(err,rows){
    					if (!err) {
							var student_name = rows[0].name;
							server.plugins['models'].classes_infos.add_students(class_id,student_id,student_name,function(err,result){
		    					if (result.affectedRows>0) {
		                            save_success.push(student_id);
		                            cb();
		    					}else {
		                            console.log(result.message);
		                            save_fail.push(student_id);
		                            cb();
		    					}
		    				});
    					}else {
							console.log(rows.message);
                            save_fail.push(student_id);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });
			}
		},
		//查询班级学员
		{
			method: "GET",
			path: '/search_students_byId',
			handler: function(request, reply) {
				var id = request.query.class_id;
				var ep =  eventproxy.create("rows",
					function(rows){
					return reply({"success":true,"rows":rows,"num":rows.length,"service_info":service_info});
				});
				//查询所有班级
				server.plugins['models'].classes_infos.search_students_byId(id,function(err,rows){
					if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
			}
		},
		//查询可以添加到班级的学员
		{
			method: "GET",
			path: '/add_by_classId',
			handler: function(request, reply) {
				var id = request.query.class_id;
				if (!id) {
                    return reply({"success":false,"message":"class_id null","service_info":service_info});
                }
				server.plugins['models'].students.add_by_classId(id,function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"num":rows.length,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});


			}
		},
		//删除班级
		{
			method: 'POST',
			path: '/delete_class_student',
			handler: function(request, reply){
				var class_id = request.payload.class_id;
                var student_ids = request.payload.student_ids;
                student_ids = JSON.parse(student_ids);

                if (!class_id || student_ids.length==0) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var save_fail = [];
				var save_success = [];
                async.each(student_ids, function(student_id, cb) {
					server.plugins['models'].classes_infos.delete_class_student(class_id,student_id,function(err,result){
    					if (result.affectedRows>0) {
                            save_success.push(student_id);
                            cb();
    					}else {
                            console.log(result.message);
                            save_fail.push(student_id);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });

			}
		},
		//升班接口
		{
			method: 'POST',
			path: '/update_classAndStudents',
			handler: function(request, reply){
				var class_id1 = request.payload.class_id1;
				var class_id2 = request.payload.class_id2;
				if (!class_id1||!class_id1) {
					return reply({"success":false,"message":"class_id null","service_info":service_info});
				}
				server.plugins['models'].classes_infos.search_students_byId(class_id1,function(err,rows){
					if (!err) {
						if (rows.length==0) {
							return reply({"success":false,"message":"没有有学员升班","service_info":service_info});
						}
						var save_fail = [];
						var save_success = [];
		                async.each(rows, function(row, cb) {
							var student_id = row.student_id;
							server.plugins['models'].students.search_student_byId(student_id,function(err,rows){
		    					if (!err) {
									var student_name = rows[0].name;
									server.plugins['models'].classes_infos.add_students(class_id2,student_id,student_name,function(err,result){
				    					if (result.affectedRows>0) {
											var change_info = {
						                        "class_id1":class_id1,
						                        "class_id2":class_id2,
						                        "student_id":student_id,
						                        "type":"升班"
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
				    					}else {
				                            console.log(result.message);
				                            save_fail.push(student_id);
				                            cb();
				    					}
				    				});
		    					}else {
									console.log(rows.message);
		                            save_fail.push(student_id);
		                            cb();
		    					}
		    				});
		                }, function(err) {
		                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
		                });

					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});

			}
		},


    ]);

    next();
}

exports.register.attributes = {
    name: "classes_controller"
};
