var _ = require('lodash');
var EventProxy = require('eventproxy');

var teachers_types = function(server) {
	return {
		//查询老师分类
		get_teachers_types : function(info,cb){
            var query = `select id, name, code, remark, created_at, updated_at, flag
            from teachers_types where flag = 0
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
		account_teachers_types : function(info,cb){
			var query = `select count(1) num
			from teachers_types where flag = 0
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
		//删除
		delete_teachers_type:function(id, cb){
			var query = `update teachers_types set flag = 1, updated_at = now()
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
		//id查询老师分类
		search_type_byId : function(id, cb){
			var query = `select id, name, code, remark, created_at, updated_at, flag
			from teachers_types where flag = 0 and id = ?
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
		// 保存老师分类
		save_teachers_type : function(name, code, remark, cb){
			var query = `insert into teachers_types (name, code, remark, created_at, updated_at, flag )
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, code, remark];
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
		update_teachers_type:function(id, name, code, remark, cb){
			var query = `update teachers_types set name = ?, code = ?, remark = ?,
			updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [name, code, remark, id];
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

module.exports = teachers_types;
