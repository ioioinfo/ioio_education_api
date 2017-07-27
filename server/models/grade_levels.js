var _ = require('lodash');
var EventProxy = require('eventproxy');

var grade_levels = function(server) {
	return {

		get_grades : function(info,cb){
			var query = `select id, name, code, grade_leader, leader_id,
			state, remark, created_at, updated_at, flag
			from grade_levels where flag = 0
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

		account_grades : function(info,cb){
			var query = `select count(1) num
			from grade_levels where flag = 0
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
		save_grade : function(name, code, grade_leader, leader_id, state, remark, cb){
			var query = `insert into grade_levels (name, code, grade_leader,
				leader_id, state, remark, created_at, updated_at, flag )
				values
				(?, ?, ?,
				?, ?, ?, now(), now(),0
			)
			`;
			var coloums = [name, code, grade_leader, leader_id, state, remark];
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
		update_grade:function(id, name, code, grade_leader, leader_id, state, remark, cb){
			var query = `update grade_levels set name =?, code =?, grade_leader =?,
				leader_id =?, state = ?, remark =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, code, grade_leader, leader_id, state, remark, id
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
		//查询指定年级
		search_grade_byId : function(id, cb){
			var query = `select id, name, code, grade_leader, leader_id,
			state, remark, created_at, updated_at, flag
			from grade_levels where flag = 0 and id = ?
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
		//删除年级
		delete_grade : function(id, cb){
			var query = `update grade_levels set flag = 1, updated_at = now()
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

module.exports = grade_levels;
