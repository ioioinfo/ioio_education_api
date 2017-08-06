var _ = require('lodash');
var EventProxy = require('eventproxy');

var change_class_infos = function(server) {
	return {
		//获得所有班级
		get_change_class_infos : function(info, cb){
            var query = `select id, class_id1, class_id2, student_id, type, created_at, updated_at
            from change_class_infos where flag = 0
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
		account_change_class_infos : function(info, cb){
			var query = `select count(1) num
			from change_class_infos where flag = 0
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
		save_change_class_info : function(change_info, cb){
			var query = `insert into change_class_infos (class_id1, class_id2,
            student_id, type, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [change_info.class_id1, change_info.class_id2, change_info.student_id, change_info.type];
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
		update_change_class_info:function(change_info, cb){
			var query = `update change_class_infos set class_id1 = ?, class_id2 = ?, student_id = ?, type = ?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [change_info.class_id1, change_info.class_id2, change_info.student_id, change_info.type, change_info.id];
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
		search_change_class_byId : function(id, cb){
			var query = `select id, class_id1, class_id2, student_id, type, created_at, updated_at, flag
			from change_class_infos where flag = 0 and id = ?
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
		delete_change_class:function(id, cb){
			var query = `update change_class_infos set flag = 1, updated_at = now()
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

module.exports = change_class_infos;
