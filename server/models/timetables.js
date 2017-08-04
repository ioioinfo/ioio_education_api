var _ = require('lodash');
var EventProxy = require('eventproxy');

var timetables = function(server) {
	return {
		//获得所有班级
		get_timetables : function(info, cb){
            var query = `select id, name, starting_time, end_time, created_at, updated_at
            from timetables where flag = 0 order by starting_time asc
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
		account_timetables : function(info, cb){
			var query = `select count(1) num
			from timetables where flag = 0
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
		save_timetable : function(name,starting_time, end_time, cb){
			var query = `insert into timetables(name, starting_time, end_time, created_at, updated_at,  flag )
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, starting_time, end_time];
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
		update_timetable:function(id, name, starting_time, end_time, cb){
			var query = `update timetables set name =?,
				starting_time =?, end_time =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, starting_time, end_time, id];
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
		search_timetable_byId : function(id, cb){
			var query = `select id, name, starting_time, end_time, created_at, updated_at, flag
			from timetables where flag = 0 and id = ?
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
		delete_timetable:function(id, cb){
			var query = `update timetables set flag = 1, updated_at = now()
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

module.exports = timetables;
