var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');

var driving_register_results = function(server) {
	return {
		//获得注册学员
		get_register_results : function(info,cb){
            var query = `select id, name, identification, skill_number, result, created_at, updated_at, flag
            from driving_register_results where flag = 0
            `;
			if (info.thisPage) {
                var offset = info.thisPage-1;
                if (info.everyNum) {
                    query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
                }else {
                    query = query + " limit " + offset*20 + ",20";
                }
            }
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		account_register_results : function(info,cb){
            var query = `select count(1) num
            from driving_register_results where flag = 0
            `;
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		// 保存注册学员
		save_register_result : function(result, cb){
			var query = `insert into driving_register_results(id, name, identification, skill_number, result, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, ?,
            now(), now(), 0
			)
			`;
            var id = uuidV1();
			var coloums = [id, result.name, result.identification, result.skill_number, result.result];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//注册学员删除
		delete_register_result:function(id, cb){
			var query = `update driving_register_results set flag = 1, updated_at = now()
				where id = ?
				`;
			server.plugins['mysql'].query(query, [id], function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//id查询注册学员
		search_register_result_by_id : function(id, cb){
			var query = `select id, name, identification, skill_number, result, created_at, updated_at, created_at, updated_at, flag
			from driving_register_results where flag = 0 and id = ?
			`;
			server.plugins['mysql'].query(query,[id],function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},

	};
};

module.exports = driving_register_results;
