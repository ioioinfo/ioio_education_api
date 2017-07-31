var _ = require('lodash');
var EventProxy = require('eventproxy');

var lessons = function(server) {
	return {
		//获得所有班级
		get_lessons : function(info, cb){
            var query = `select id, plan_id, teacher_id, name, code, hours,
			level_id, created_at, updated_at
            from lessons where flag = 0
            `;

			// if (info.thisPage) {
            //     var offset = info.thisPage-1;
            //     if (info.everyNum) {
            //         query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
            //     }else {
            //         query = query + " limit " + offset*20 + ",20";
            //     }
            // }
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		account_lessons : function(info, cb){
			var query = `select count(1) num
			from lessons where flag = 0
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
		// 保存课程
		save_lesson : function(plan_id, teacher_id, name, code, hours, level_id, cb){
			var query = `insert into lessons (plan_id, teacher_id, name, code, hours, level_id, created_at, updated_at,  flag )
			values
			(?, ?, ?, ?, ?,
			?, now(), now(),
			0
			)
			`;
			var coloums = [plan_id, teacher_id, name, code, hours, level_id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//更新
		update_lesson:function(id, plan_id, teacher_id, name, code, hours, level_id, cb){
			var query = `update lessons set plan_id =?, teacher_id =?, name =?,
				code =?, hours = ?, level_id =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [plan_id, teacher_id, name, code, hours, level_id, id
			];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询指定课程
		search_lesson_byId : function(id, cb){
			var query = `select id, plan_id, teacher_id, name, code, hours, level_id, created_at, updated_at, flag
			from lessons where flag = 0 and id = ?
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
		//删除课程
		delete_lesson:function(id, cb){
			var query = `update lessons set flag = 1, updated_at = now()
				where id = ? and flag =0
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

	};
};

module.exports = lessons;
