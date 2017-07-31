var _ = require('lodash');
var EventProxy = require('eventproxy');

var learning_records = function(server) {
	return {
		get_learning_records : function(info, cb){
			var query = `select id, student_id, class_id, plan_id, lesson_id,
			level_id, hours, DATE_FORMAT(starting_date,'%Y-%m-%d %H:%i:%S')starting_date, DATE_FORMAT(end_date,'%Y-%m-%d %H:%i:%S')end_date, created_at, updated_at, flag
			from learning_records where flag = 0
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
		account_learning_records : function(info, cb){
			var query = `select count(1) num
			from learning_records where flag = 0
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

		// 保存学习记录
		save_learning_record : function(learning_record, cb){
			var query = `insert into learning_records (student_id, class_id, plan_id, lesson_id, level_id, hours, starting_date, end_date, created_at, updated_at, flag )
			values
			(?, ?, ?,
			?, ?, ?, ?, ?, now(),
			now(), 0
			)
			`;
			var coloums = [learning_record.student_id, learning_record.class_id, learning_record.plan_id, learning_record.lesson_id, learning_record.level_id, learning_record.hours, learning_record.starting_date, learning_record.end_date];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询指定学习记录
		search_learning_record_byId : function(id, cb){
			var query = `select id, student_id, class_id, plan_id, lesson_id,
			level_id, hours, DATE_FORMAT(starting_date,'%Y-%m-%d %H:%i:%S')starting_date, DATE_FORMAT(end_date,'%Y-%m-%d %H:%i:%S')end_date, created_at, updated_at, flag
			from learning_records where flag = 0 and id = ?
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


	};
};

module.exports = learning_records;
