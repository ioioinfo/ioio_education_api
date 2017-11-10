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
        //查询结果列表
        {
            method: "GET",
            path: '/get_register_results',
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
                //查询学员
                server.plugins['models'].driving_register_results.get_register_results(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				//查询学员数量
                server.plugins['models'].driving_register_results.account_register_results(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
            }
        },
        //结果添加，批量
        {
			method: 'POST',
			path: '/save_register_result',
			handler: function(request, reply){
                var result = request.payload.result;
                result = JSON.parse(result);
                // var result = {
                //     "name" : "孙楠",
                //     "identification" : "310226199103023322",
                //     "skill_number" : "31000212",
                //     "result" : "合格"
                // };
                if (!result.name || !result.identification || !result.skill_number || !result.result) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}

				server.plugins['models'].driving_register_results.save_register_result(result, function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info});
					}
				});

			}
		},
        //删除结果
        {
            method: 'POST',
            path: '/delete_register_result',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].driving_register_results.delete_register_result(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //根据id查结果
        {
            method: "GET",
            path: '/search_register_result_by_id',
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
                //查询学员
                server.plugins['models'].driving_register_results.search_register_result_by_id(id,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
            }
        },


    ]);

    next();
}

exports.register.attributes = {
    name: "register_results_controller"
};
