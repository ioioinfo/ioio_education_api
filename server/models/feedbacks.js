var _ = require('lodash');
var EventProxy = require('eventproxy');

var feedbacks = function(server) {
	return {
		//查询反馈
		get_feedbacks : function(info,cb){
            var query = `select id, student_id, student_name, feedback_person,  feedback_content, state, DATE_FORMAT(feedback_date,'%Y-%m-%d')feedback_date, created_at, updated_at, flag
            from feedbacks where flag = 0
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
		account_feedbacks : function(info,cb){
            var query = `select count(1) num from feedbacks where flag = 0`;

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
		delete_feedback:function(id, cb){
			var query = `update feedbacks set flag = 1, updated_at = now()
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
		//id查询反馈
		search_feedback_byId : function(id, cb){
			var query = `select id, student_id, student_name, feedback_person,  feedback_content, state, DATE_FORMAT(feedback_date,'%Y-%m-%d')feedback_date, created_at, updated_at, flag
			from feedbacks where flag = 0 and id = ?
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
		// 保存反馈
        save_feedback : function(feedback, cb){
            var query = `insert into feedbacks (student_id, student_name, feedback_person, feedback_content, state, feedback_date, created_at, updated_at, flag )
            values
            (?, ?,
            ?, ?, ?, ?, now(),
			now(), 0
            )
            `;
            var coloums = [feedback.student_id, feedback.student_name,
			feedback.feedback_person, feedback.feedback_content,
			feedback.state, feedback.feedback_date];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		//更新反馈
		update_feedback:function(feedback, cb){
				var query = `update feedbacks set student_id =?, student_name =?,
				feedback_person = ?, feedback_content =?, state =?, feedback_date =?,
				updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [feedback.student_id, feedback.student_name,
			feedback.feedback_person, feedback.feedback_content,
			feedback.state, feedback.feedback_date, feedback.id];
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

module.exports = feedbacks;
