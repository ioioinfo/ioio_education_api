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
			var query = `select id, name, code, remark, created_at, updated_at, flag
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


	};
};

module.exports = teachers_types;
