gps-tracks-analyzer
===================

Simple web application for analyzing gps tracks: two [Node.js](http://nodejs.org/) servers and simple demo for showing results.

Servers require some packages: [pg](https://www.npmjs.org/package/pg), [dateformat](https://www.npmjs.org/package/dateformat) and [winston](https://www.npmjs.org/package/winston).

`appDataToDB.js` - server for collecting data from mobile app and storing it into PostgreSQL Database.

`dbDataToApp.js` - server for requesting data from PostgreSQL Database by `GET` method.
