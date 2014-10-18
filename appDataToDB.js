var http = require('http'),
    url = require('url'),
    dateFormat = require('dateformat'),
    pg = require('pg'),
    winston = require('winston'),
    conString = "postgres://username:password@localhost/database";

var logger = new (winston.Logger)({
    transports: [
    new (winston.transports.Console)({ timestamp: true, colorize: true, level: 'verbose', handleExceptions: true }),
    new (winston.transports.File)({ filename: 'gps_tracking.log', timestamp: true, level: 'error', handleExceptions: true })
    ]
});

http.createServer(function (req, res) {
    var urlParsed = url.parse(req.url, true),
    urlQuery = urlParsed.query;
    pg.connect(conString, function(err, client, done) {
        if(err) {
            //return console.error('error fetching client from pool', err);
                return logger.error('Error fetching client from pool', err);
            }
            client.query('INSERT INTO routing.waypoints (uid, acc, alt, dir, point, prov, speed, time_sys, time_utc, date_sys) VALUES ($1, $2, $3, $4, ST_GeomFromText($5,4326), $6, $7, $8::timestamp, $9, $10::date)',
                [urlQuery.uid, urlQuery.acc, urlQuery.alt, urlQuery.dir, ('POINT(' + urlQuery.lon + ' ' + urlQuery.lat + ')'), urlQuery.prov, urlQuery.speed, urlQuery.time, dateFormat(new Date(+urlQuery.time_utc), "yyyy-mm-dd HH:MM:ss"), urlQuery.time],
                function(err, result) {
                //call `done()` to release the client back to the pool
                done();

                if(err) {
                        //return console.error('error running query', err);
                        return logger.error('Error running query', err);
                    }
                //console.log('One more line saved to DataBase');
                logger.info('Record saved to DataBase', urlQuery);
            });
});
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end();
}).listen(6544, '127.0.0.1');
console.log('Server running at http://127.0.0.1:6544/');
