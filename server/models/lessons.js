var _ = require('lodash');
var EventProxy = require('eventproxy');

var lessons = function(server) {
	return {
		//获得所有班级
		get_lessons : function(info, cb){
            var query = `select id, plan_id, teacher_id, name, code, hours,
			level_id, created_at, updated_at
            from lessons where flag = 0
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
		account_lessons : function(info, cb){
			var query = `select count(1) num
			from lessons where flag = 0
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


	};
};

module.exports = lessons;
