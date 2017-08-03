var _ = require('lodash');
var EventProxy = require('eventproxy');

var education_plans = function(server) {
	return {
        //查询考试
		get_education_plans : function(info,cb){
            var query = `select id, class_id, name, code, hours, teacher_id,
            assistant_id, DATE_FORMAT(starting_date,'%Y-%m-%d')starting_date, DATE_FORMAT(end_date,'%Y-%m-%d')end_date, subject_id, created_at, updated_at, flag
            from education_plans where flag = 0
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
        account_education_plans : function(info,cb){
            var query = `select count(1) num from education_plans where flag = 0`;

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
		delete_education_plan:function(id, cb){
			var query = `update education_plans set flag = 1, updated_at = now()
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
		search_education_plan_byId : function(id, cb){
			var query = `select id, class_id, name, code, hours, teacher_id,
            assistant_id, DATE_FORMAT(starting_date,'%Y-%m-%d')starting_date, DATE_FORMAT(end_date,'%Y-%m-%d')end_date, subject_id, created_at, updated_at, flag
			from education_plans where flag = 0 and id = ?
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
        save_education_plan : function(plan, cb){
            var query = `insert into education_plans(class_id, name, code, hours, teacher_id, assistant_id, starting_date, end_date, subject_id, created_at, updated_at, flag )
            values
            (?, ?, ?, ?,
            ?, ?, ?, ?, ?, now(), now(), 0
            )
            `;
            var coloums = [plan.class_id, plan.name, plan.code, plan.hours, plan.teacher_id, plan.assistant_id, plan.starting_date, plan.end_date,
            plan.subject_id];
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
		update_education_plan:function(plan, cb){
				var query = `update education_plans set class_id=?, name=?,
                code=?, hours=?, teacher_id=?, assistant_id=?,  starting_date = ?,
				end_date = ?, subject_id = ?, updated_at = now()
				where id = ? and flag =0
				`;
			var coloums = [plan.class_id, plan.name, plan.code, plan.hours, plan.teacher_id, plan.assistant_id, plan.starting_date, plan.end_date,
            plan.subject_id, plan.id];
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

module.exports = education_plans;
