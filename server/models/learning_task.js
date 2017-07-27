var _ = require('lodash');
var EventProxy = require('eventproxy');

var learning_task = function(server) {
	return {
		//获得所有班级
		get_learning_tasks : function(info, cb){
			var query = `select id, student_id, class_id, plan_id, lesson_id,
			level_id, state, progress_rate, current_hours, total_hours,
			created_at, updated_at, flag
			from learning_task where flag = 0
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
		account_tasks : function(info, cb){
			var query = `select count(1) num
			from learning_task where flag = 0
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
		save_learning_task : function(student_id, class_id, plan_id, lesson_id,
		level_id, total_hours, cb){
			var query = `insert into learning_task (student_id, class_id, plan_id, lesson_id,
			level_id, state, progress_rate, current_hours, total_hours, created_at, updated_at, flag )
			values
			(?, ?, ?, ?,
			?, "创建", 0, 0, ?, now(),
			now(),0
			)
			`;
			var coloums = [student_id, class_id, plan_id, lesson_id, level_id,
				total_hours];
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
		update_learning_task:function(id, state, progress_rate, current_hours, cb){
			var query = `update learning_task set state =?, progress_rate =?,
				current_hours =?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [state, progress_rate, current_hours,id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询指定任务
		search_task_byId : function(id, cb){
			var query = `select id, student_id, class_id, plan_id, lesson_id,
			level_id, state, progress_rate, current_hours, total_hours, created_at, updated_at, flag
			from learning_task where flag = 0 and id = ?
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
		//删除任务
		delete_lesson:function(id, cb){
			var query = `update learning_task set flag = 1, updated_at = now()
				where id = ?
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

module.exports = learning_task;
