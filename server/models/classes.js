var _ = require('lodash');
var EventProxy = require('eventproxy');

var classes = function(server) {
	return {
		//获得所有班级
		get_classes : function(info, cb){
            var query = `select id, name, code, state,classroom_id, DATE_FORMAT(starting_date,'%Y-%m-%d') starting_date, DATE_FORMAT(end_date,'%Y-%m-%d') end_date, class_master, master_id, remarks, created_at, updated_at, flag, level_id
            from classes where flag = 0
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

		account_classes : function(info, cb){
            var query = `select count(1) num
            from classes where flag = 0
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

		// 保存班级
        save_class : function(classroom_id, name, code, state, starting_date, end_date, 	class_master, master_id, remarks, level_id, cb){
    		var query = `insert into classes (classroom_id, name, code, state, starting_date,  end_date, class_master, master_id, remarks, level_id, created_at, updated_at,  flag )
			values
			(?, ?, ?, ?, ?,
			?, ?, ?, ?, ?, now(), now(),
			0
			)
            `;
            var coloums = [classroom_id, name, code, state, starting_date,
				end_date, class_master, master_id, remarks, level_id];
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
		update_class:function(id, classroom_id, name, code, state, starting_date, end_date, 	class_master, master_id, remarks, level_id, cb){
    		var query = `update classes set classroom_id =?, name =?,
				code =?, state =?, starting_date =?,
				end_date =?, class_master =?, master_id =?, remarks =?,
				level_id =?, updated_at = now()
				where id = ? and flag = 0
                `;
            var coloums = [classroom_id, name, code, state, starting_date, end_date,   class_master, master_id, remarks, level_id, id
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
		//查询指定班级
		search_class_byId : function(id, cb){
			var query = `select id, classroom_id, name, code, state, DATE_FORMAT(starting_date,'%Y-%m-%d') starting_date, DATE_FORMAT(end_date,'%Y-%m-%d') end_date, class_master, master_id, remarks, created_at, updated_at, flag, level_id
			from classes where flag = 0 and id = ?
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
		//班级删除
		delete_class:function(id, cb){
			var query = `update classes set flag = 1, updated_at = now()
				where id = ? and state = "已关闭"
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

module.exports = classes;
