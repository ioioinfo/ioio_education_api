var _ = require('lodash');
var EventProxy = require('eventproxy');

var exams_records = function(server) {
	return {
        //查询考试记录
		get_exams_records : function(info,cb){
            var query = `select id, exam_id,  student_id,  state,  score,
            created_at, updated_at, flag
            from exams_records where flag = 0
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
        account_exams_records : function(info,cb){
            var query = `select count(1) num from exams_records where flag = 0`;

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
		delete_exam_record:function(id, cb){
			var query = `update exams_records set flag = 1, updated_at = now()
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
		search_record_byId : function(id, cb){
			var query = `select id, exam_id,  student_id,  state,  score,
            created_at, updated_at, flag
			from exams_records where flag = 0 and id = ?
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
        save_exam_record : function(exam_record, cb){
            var query = `insert into exams_records (exam_id, student_id, state,  score, created_at, updated_at, flag )
            values
            (?, ?, ?,
            ?, now(), now(), 0
            )
            `;
            var coloums = [exam_record.exam_id, exam_record.student_id, exam_record.state, exam_record.score];
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
		update_exam_record:function(exam_record, cb){
				var query = `update exams_records set exam_id =?, student_id =?, state =?, score =?, updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [exam_record.exam_id, exam_record.student_id, exam_record.state, exam_record.score, exam_record.id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//学员查询所有成绩历史
		search_record_by_student : function(student_id, cb){
			var query = `select id, exam_id,  student_id,  state,  score,
            created_at, updated_at, flag
			from exams_records where flag = 0
			and student_id = ? order by created_at desc
			`;
			server.plugins['mysql'].query(query,[student_id],function(err, results) {
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

module.exports = exams_records;
