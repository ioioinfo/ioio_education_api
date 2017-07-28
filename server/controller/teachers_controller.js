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
        //查询老师列表
        {
            method: "GET",
            path: '/get_teachers',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows", "types", "num",
					function(rows, types, num){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (types[row.type_id]) {
                                row.level = types[row.type_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询学员
                server.plugins['models'].teachers.get_teachers(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].teachers.account_teachers(info,function(err,rows){
					if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                //查询所有年级
                server.plugins['models'].teachers_types.get_teachers_types(info2,function(err,rows){
                    if (!err) {
                        var types_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            types_map[rows[i].id] = rows[i];
                        }
                        ep.emit("types", types_map);
                    }else {
                        ep.emit("types", {});
                    }
                });
            }
        },
        //老师添加，批量
        {
			method: 'POST',
			path: '/save_teacher',
			handler: function(request, reply){
                var teachers = request.payload.teachers;
                teachers = JSON.parse(teachers);
                if (teachers.length==0) {
                    return reply({"success":false,"message":"teachers wrong","service_info":service_info});
                }

                // var teacher = {
                //     "name" : "无敌",
                //     "code" : "002",
                //     "age" : "29岁",
                //     "sex" : "男",
                //     "phone" : "13829839233",
                //     "state" : "已报名",
                //     "address" : "大厦",
                //     "province" : "北京",
                //     "city" : "北京",
                //     "district" : "朝阳区",
                //     "photo" : "无",
                //     "type_id" : 1,
                //     "is_master": 1,
                //     "is_leader" : 1
                // };
                // var teachers = [];
                // teachers.push(teacher);
                var save_fail = [];
				var save_success = [];
                async.each(teachers, function(teacher, cb) {
                    server.plugins['models'].teachers.save_teacher(teacher,function(err,result){
    					if (result.affectedRows>0) {
                            save_success.push(teacher.name);
                            cb();
    					}else {
                            console.log(content.message);
                            save_fail.push(teacher.name);
                            cb();
    					}
    				});
                }, function(err) {
                    return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"save_fail":save_fail,"fail_num":save_fail.length});
                });
			}
		},
        //删除老师
        {
            method: 'POST',
            path: '/delete_teacher',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].teachers.delete_teacher(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //根据id查询老师
        {
            method: "GET",
            path: '/search_teacher_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "types",
                    function(rows, types){
                        // for (var i = 0; i < rows.length; i++) {
                        //     var row = rows[i];
                        //     if (types[row.type_id]) {
                        //         row.level = types[row.type_id];
                        //     }
                        // }
                    return reply({"success":true,"rows":rows,"types":types,"service_info":service_info});
                });
                //查询学员
                server.plugins['models'].teachers.search_teacher_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                //查询所有年级
                server.plugins['models'].teachers_types.get_teachers_types(info2,function(err,rows){
                    if (!err) {
                        ep.emit("types", rows);
                    }else {
                        ep.emit("types", []);
                    }
                });
            }
        },
        //更新老师信息
        {
            method: 'POST',
            path: '/update_teacher',
            handler: function(request, reply){
                var teacher = request.payload.teacher;
                teacher = JSON.parse(teacher);
                if (!teacher.id||!teacher.name|| !teacher.code|| !teacher.age|| !teacher.sex|| !teacher.phone|| !teacher.state||!teacher.address|| !teacher.province|| !teacher.city|| !teacher.district|| !teacher.photo|| !teacher.type_id|| !teacher.is_master|| !teacher.is_leader || !teacher.level) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                var id = teacher.id;
                var name = teacher.name;
                var code = teacher.code;
                var age = teacher.age;
                var sex = teacher.sex;
                var phone = teacher.phone;
                var state = teacher.state;
                var address = teacher.address;
                var province = teacher.province;
                var city = teacher.city;
                var district = teacher.district;
                var photo = teacher.photo;
                var type_id = teacher.type_id;
                var is_master = teacher.is_master;
                var is_leader = teacher.is_leader;
				var level = teacher.level;

                server.plugins['models'].teachers.update_teacher(id, name, code, age, sex, phone, state, address, province, city, district, photo, type_id, is_master, is_leader, level, function(err,result){
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
    name: "teachers_controller"
};
