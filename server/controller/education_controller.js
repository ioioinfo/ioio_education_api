/**
 ┌──────────────────────────────────────────────────────────────┐
 │               ___ ___ ___ ___ ___ _  _ ___ ___               │
 │              |_ _/ _ \_ _/ _ \_ _| \| | __/ _ \              │
 │               | | (_) | | (_) | || .` | _| (_) |             │
 │              |___\___/___\___/___|_|\_|_| \___/              │
 │                                                              │
 │                                                              │
 │                       set up in 2015.2                       │
 │                                                              │
 │   committed to the intelligent transformation of the world   │
 │                                                              │
 └──────────────────────────────────────────────────────────────┘
*/

var _ = require('lodash');
var r = require('request');
var moment = require('moment');
var eventproxy = require('eventproxy');


exports.register = function(server, options, next) {

    server.route([
        //查询数据
        // {
        //     method: "GET",
        //     path: '/list_data',
        //     handler: function(request, reply) {
        //         return reply({"success":true,"rows":[],"num":0});
        //     }
        // },

    ]);

    next();
}

exports.register.attributes = {
    name: "education_controller"
};
