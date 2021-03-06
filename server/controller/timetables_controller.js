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
		//查询学科
        {
            method: "GET",
            path: '/get_timetables',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num",
					function(rows, num){

					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有课程
                server.plugins['models'].timetables.get_timetables(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].timetables.account_timetables(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});

            }
        },
		//id查询老师分类
        {
            method: "GET",
            path: '/search_timetable_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
				var info2 = {};
                var ep =  eventproxy.create("rows",
					function(rows){

					return reply({"success":true,"rows":rows,"service_info":service_info});
				});
                //查询
                server.plugins['models'].timetables.search_timetable_byId(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});

            }
        },
		//删除
		{
			method: 'POST',
			path: '/delete_timetable',
			handler: function(request, reply){
				var id = request.payload.id;
				if (!id) {
					return reply({"success":false,"message":"id null","service_info":service_info});
				}

				server.plugins['models'].timetables.delete_timetable(id, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});
			}
		},
		//新增老师分类
		{
			method: 'POST',
			path: '/save_timetable',
			handler: function(request, reply){
				var name = request.payload.name;
				var starting_time = request.payload.starting_time;
				var end_time =  request.payload.end_time;

				if (!name || !starting_time || !end_time) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].timetables.save_timetable(name, starting_time, end_time, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
		//更新老师分类
		{
			method: 'POST',
			path: '/update_timetable',
			handler: function(request, reply){
				var id = request.payload.id;
                var name = request.payload.name;
				var starting_time = request.payload.starting_time;
				var end_time =  request.payload.end_time;

				if (!name || !starting_time || !end_time || !id) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].timetables.update_timetable(id, name, starting_time, end_time, function(err,result){
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
    name: "timetables_controller"
};
