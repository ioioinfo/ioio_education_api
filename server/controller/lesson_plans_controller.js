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
        //查询教学计划列表
        {
            method: "GET",
            path: '/get_lesson_plans',
            handler: function(request, reply) {
				var params = request.query.params;
				var info = {};
				if (params) {
					info = JSON.parse(params);
				}
				var info2 = {};
                var ep =  eventproxy.create("rows", "grades",
					function(rows, grades){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].lesson_plans.get_lesson_plans(info,function(err,rows){
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
            }
        },
        //查询教学计划查询
        {
            method: "GET",
            path: '/search_plan_byId',
            handler: function(request, reply) {
                var id = request.query.id;
				var info2 = {};
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var ep =  eventproxy.create("rows", "grades","grades_level",
					function(rows, grades, grades_level){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (grades[row.level_id]) {
                                row.level = grades[row.level_id];
                            }
                        }
					return reply({"success":true,"rows":rows,"grades_level":grades_level,"service_info":service_info});
				});
                //查询教学计划
                server.plugins['models'].lesson_plans.search_plan_byId(id,function(err,rows){
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
                        ep.emit("grades_level", rows);
                    }else {
                        ep.emit("grades", {});
                        ep.emit("grades_level", []);
                    }
                });
            }
        },
        //删除
        {
            method: 'POST',
            path: '/delete_plan',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].lesson_plans.delete_plan(id, function(err,result){
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
			path: '/save_plan',
			handler: function(request, reply){
                var name = request.payload.name;
                var code = request.payload.code;
                var level_id = request.payload.level_id;
                if (!name || !code || !level_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].lesson_plans.save_plan(name, code, level_id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

			}
		},
        //更新老师信息
        {
            method: 'POST',
            path: '/update_plan',
            handler: function(request, reply){
                var id = request.payload.id;
                var name = request.payload.name;
                var code = request.payload.code;
                var level_id = request.payload.level_id;
                if (!id||!name||!code||!level_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].lesson_plans.update_plan(id, name, code, level_id, function(err,result){
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
    name: "lesson_plans_controller"
};
