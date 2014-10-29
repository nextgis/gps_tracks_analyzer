gps-tracks-analyzer
===================

Simple web application for analyzing gps tracks: two [Node.js](http://nodejs.org/) servers and simple demo for showing results.

Servers require some packages: [pg](https://www.npmjs.org/package/pg), [dateformat](https://www.npmjs.org/package/dateformat) and [winston](https://www.npmjs.org/package/winston).

`appDataToDB.js` - server for collecting data from mobile app and storing it into PostgreSQL Database.

`dbDataToApp.js` - server for requesting data from PostgreSQL Database by `GET` method.

Example of table in PostgreSQL database:
```SQL
CREATE TABLE IF NOT EXISTS routing.waypoints (
uid	varchar(50),
acc	real,
alt	real,
dir	real,
prov	varchar(50),
speed	real,
date_sys	date,
time_sys	timestamp,
time_utc	timestamp
);
SELECT AddGeometryColumn('routing', 'waypoints', 'point', 4326, 'POINT', 2);
```
For running demo you should create simple http server with proxy, here is example for [nginx](http://nginx.org/ru/) config:
```
server {
        root /path_to_demo.html_on_your_machine;
        listen 127.0.0.1:6547;

        location / {
                root /path_to_demo.html_on_your_machine;
        }
        location /raw {
                # IP where dbDataToApp.js is listening
                proxy_pass http://127.0.0.1:6545/;
        }
}
```
