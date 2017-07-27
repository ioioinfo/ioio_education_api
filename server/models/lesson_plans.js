var _ = require('lodash');
var EventProxy = require('eventproxy');

var lesson_plans = function(server) {
	return {
		search_plan_byId : function(id, cb){
            var query = `select id, name, code, created_at, updated_at, flag, level_id
            from lesson_plans where id = ? and flag =0
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

		get_lesson_plans : function(info, cb){
            var query = `select id, name, code, created_at, updated_at, flag, level_id
            from lesson_plans where flag = 0
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

		delete_plan:function(id, cb){
			var query = `update lesson_plans set flag = 1, updated_at = now()
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
		// 保存计划
		save_plan : function(name, code, level_id, cb){
			var query = `insert into lesson_plans (name, code, level_id, created_at, updated_at, flag)
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, code, level_id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//更新信息
		update_plan:function(id, name, code, level_id, cb){
			var query = `update lesson_plans set name =?, code =?, level_id =?,
			updated_at = now()
			where id = ? and flag =0
				`;
			var coloums = [name, code, level_id, id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
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

module.exports = lesson_plans;
