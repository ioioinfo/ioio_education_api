var _ = require('lodash');
var EventProxy = require('eventproxy');

var exams = function(server) {
	return {
        //查询考试
		get_exams : function(info,cb){
            var query = `select id, name, code, level_id, class_id, lesson_id,
            state, starting_date, end_date, created_at, updated_at, flag
            from exams where flag = 0
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
        account_exams : function(info,cb){
            var query = `select count(1) num from exams where flag = 0`;

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
		delete_exam:function(id, cb){
			var query = `update exams set flag = 1, updated_at = now()
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
        //id查询考试
		search_exam_byId : function(id, cb){
			var query = `select id, name, code, level_id, class_id, lesson_id,
            state, DATE_FORMAT(starting_date,'%Y-%m-%d')starting_date, DATE_FORMAT(end_date,'%Y-%m-%d')end_date, created_at, updated_at, flag
			from exams where flag = 0 and id = ?
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
        // 保存考试
        save_exam : function(exam, cb){
            var query = `insert into exams (name, code, level_id, class_id, lesson_id, state, starting_date, end_date, created_at, updated_at, flag )
            values
            (?, ?, ?, ?, ?,
            ?, ?, ?, now(), now(), 0
            )
            `;
            var coloums = [exam.name, exam.code, exam.level_id, exam.class_id, exam.lesson_id, exam.state, exam.starting_date, exam.end_date];
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
		update_exam:function(exam, cb){
				var query = `update exams set name = ?, code = ?, level_id = ?, class_id = ?, lesson_id = ?, state = ?, starting_date = ?,
				end_date = ?, updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [exam.name, exam.code, exam.level_id,
				exam.class_id, exam.lesson_id, exam.state, exam.starting_date, exam.end_date, exam.id];
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

module.exports = exams;
