var _ = require('lodash');
var EventProxy = require('eventproxy');

var subjects = function(server) {
	return {
		//获得所有班级
		get_subjects : function(info, cb){
            var query = `select id, name, code, created_at, updated_at
            from subjects where flag = 0
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
		account_subjects : function(info, cb){
			var query = `select count(1) num
			from subjects where flag = 0
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
		save_subject : function(name,code, cb){
			var query = `insert into subjects (name, code, created_at, updated_at,  flag )
			values
			(?, ?, now(), now(),
			0
			)
			`;
			var coloums = [name, code];
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
		update_subject:function(id, name, code, cb){
			var query = `update subjects set name =?,
				code =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, code, id];
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
		search_subject_byId : function(id, cb){
			var query = `select id, name, code, created_at, updated_at, flag
			from subjects where flag = 0 and id = ?
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
		delete_subject:function(id, cb){
			var query = `update subjects set flag = 1, updated_at = now()
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

module.exports = subjects;
