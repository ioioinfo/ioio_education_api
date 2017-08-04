var _ = require('lodash');
var EventProxy = require('eventproxy');

var schedules = function(server) {
	return {
		//获得所有班级
		get_schedules : function(info, cb){
            var query = `select id, name, plan_id, time_id, class_id, day,
            created_at, updated_at
            from schedules where flag = 0
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
		account_schedules : function(info, cb){
			var query = `select count(1) num
			from schedules where flag = 0
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
		save_schedule : function(schedule, cb){
			var query = `insert into schedules (name, plan_id, time_id, class_id, day, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, ?,
            now(), now(), 0
			)
			`;
			var coloums = [schedule.name, schedule.plan_id, schedule.time_id, schedule.class_id, schedule.day];
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
		update_schedule:function(schedule, cb){
			var query = `update schedules set name =?, plan_id =?, time_id =?,
            class_id =?, day =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [schedule.name, schedule.plan_id, schedule.time_id, schedule.class_id, schedule.day, schedule.id];
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
		search_schedule_byId : function(id, cb){
			var query = `select id, name, plan_id, time_id, class_id, day, created_at, updated_at, flag
			from schedules where flag = 0 and id = ?
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
		delete_schedule:function(id, cb){
			var query = `update schedules set flag = 1, updated_at = now()
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

module.exports = schedules;
