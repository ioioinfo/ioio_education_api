var _ = require('lodash');
var EventProxy = require('eventproxy');

var classrooms = function(server) {
	return {
		//获得所有班级
		get_classrooms : function(info, cb){
            var query = `select id, name, code, location, created_at, updated_at
            from classrooms where flag = 0
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
		account_classrooms : function(info, cb){
			var query = `select count(1) num
			from classrooms where flag = 0
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
		save_classroom : function(name,code,location, cb){
			var query = `insert into classrooms(name, code, location, created_at, updated_at,  flag )
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, code, location];
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
		update_classroom:function(id, name, location, code, cb){
			var query = `update classrooms set name =?,
				code =?, location =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, code, location, id];
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
		search_classroom_byId : function(id, cb){
			var query = `select id, name, code, location, created_at, updated_at, flag
			from classrooms where flag = 0 and id = ?
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
		delete_classroom:function(id, cb){
			var query = `update classrooms set flag = 1, updated_at = now()
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

module.exports = classrooms;
