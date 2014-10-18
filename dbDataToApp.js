var http = require('http'),
    url = require('url'),
    pg = require('pg'),
    conString = "postgres://username:password@localhost/database";

http.createServer(function (req, res) {
    var urlParsed = url.parse(req.url, true),
        urlQuery = urlParsed.query;

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('Error fetching client from pool', err);
        }
        var query = client.query('SELECT uid, ST_AsText(trackLine) As track_line, ST_AsText(ST_StartPoint(trackLine)) As track_start_point, ST_AsText(ST_EndPoint(trackLine)) As track_end_point, ST_Length_Spheroid(trackLine,$3) As track_length, to_char(date_sys,$4) As track_date, minTime::time As time_start, maxTime::time As time_end FROM (SELECT uid, date_sys, min(time_sys) As minTime, max(time_sys) As maxTime, ST_MakeLine(point ORDER BY time_sys) As trackLine FROM (SELECT * FROM routing.waypoints WHERE time_sys <= $1::date AND time_sys > ($1::date - $2::integer)) As tracker GROUP BY date_sys, uid) As tracks',
            [urlQuery.date, urlQuery.period, 'SPHEROID["GRS_1980",6378137,298.257222101]', 'YYYY-MM-DD']);

        query.on('row', function(row, result) {
            row.track_data = {'track_line': row.track_line, 'start_point': row.track_start_point, 'end_point': row.track_end_point};
            result.addRow(row);
        });
        query.on('error', function(error) {
            return console.error('Error running query', err);
        });
        query.on('end', function(result) {
            //call `done()` to release the client back to the pool
            done();
            console.log(result.rowCount + ' rows were received from DataBase');
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end(JSON.stringify(result.rows));
        })
    });
}).listen(6545, '127.0.0.1');
console.log('Server running at http://127.0.0.1:6545/');
