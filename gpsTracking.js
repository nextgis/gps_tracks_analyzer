var tilesUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	attrib = '&copy; Map tiles by <a href="http://nextgis.ru/">NextGIS</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> | <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	main = L.tileLayer(tilesUrl, {maxZoom: 18, attribution: attrib}),
	overlay = L.tileLayer(memoTiles, {maxZoom: 18, attribution: attrib}),
	map = new L.Map('map', {
		layers: [main],
		//center: [55.7610, 37.6283], //Москва
		center: [51.7665189791, 55.0970916748], //Оренбург
		zoom: 11 
	});

var palette = colorbrewer.Set1[5],
	tableBlock = d3.select("div#tableBlock"),
	shownTracks= [],
	dateNow = new Date(),
	date = dateNow.setDate(dateNow.getDate() + 1);
//Data to our dbDataToApp.js  proxed server
var url = 'http://127.0.0.1/gps_tracking/raw' + '?date=' + new Date().toISOString().slice(0, 10) + '&period=5';

var request = new XMLHttpRequest();
	request.open('GET', url, true);

request.onload = function() {
	if (request.status >= 200 && request.status < 400){
		// Success!
		var resp = JSON.parse('{"tracks": ' + request.responseText + '}');
		processResponse(resp);
	} else {
		// We reached our target server, but it returned an error
		console.log(request.status);
	}
};
request.onerror = function() {
	// There was a connection error of some sort
	console.log('Connection error')
};
request.send();

function processResponse(response) {
    var resData = response.tracks;
    resData.forEach(function(element, index, array) {
    	element.track_length = (+element.tracklength).toFixed(1); 
	});	
	tabulate(tableBlock, resData, ['uid', 'track_date', 'track_length', 'time_start', 'time_end', 'track_data'],
								  ['Идентификатор', 'Дата', 'Длина (м)', 'Начало', 'Конец', 'Трек']);
};

function tabulate(parentNode, data, columns, headers) {
	var table = parentNode.append("table").attr("class", "tabulated"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

	// append the header row
	thead.append("tr")
		.selectAll("th")
		.data(headers)
		.enter()
		.append("th")
		.text(function(column) { return column; });

	// create a row for each object in the data
	var rows = tbody.selectAll("tr")
	.data(data)
	.enter()
	.append("tr");

	// create a cell in each row for each column
	var cells = rows.selectAll("td")
	.data(function(row) {
		return columns.map(function(column) {
			return {column: column, value: row[column], rowID: row[columns[0]] + row[columns[2]]};
		});
	})
	.enter()
	.append("td")
	.html(function(d) {
		if (d.column == 'track_data') { return '<image class="icon" src="img/map-icon.png">'; }
		else { return d.value; }
	 })
	.attr('class', function(d) {
		if (d.column == 'track_length') { return 'alignRight'; }
		else { return 'alignCenter'; };
	})
	.on('click', function(d) {
		if ((d.column == 'track_data') && (Object.keys(shownTracks).indexOf(d.rowID) == -1)) { addTrackToMap(map, d.value, d.rowID); }
		else if ((d.column == 'track_data') && (Object.keys(shownTracks).indexOf(d.rowID) != -1)) { removeTrackFromMap(map, d.rowID); }
	});
	
	return table;
};

function addTrackToMap(map, track, id) {
	var startPointLayer = L.geoJson(null, {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, startMarkerOptions);
		}
	});
	var endPointLayer = L.geoJson(null, {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, endMarkerOptions);
		}
	});
	var startMarkerOptions = {
		radius: 9,
		fillColor: palette[0],
		color: "#fff",
		weight: 3,
		opacity: 0.5,
		fillOpacity: 0.5
	};
	var endMarkerStartOptions = {
		radius: 9,
		fillColor: palette[0],
		color: "#000",
		weight: 3,
		opacity: 0.5,
		fillOpacity: 0.5
	};	
	var trackLine = omnivore.wkt.parse(track.track_line),
		trackStart = omnivore.wkt.parse(track.start_point),
		trackEnd = omnivore.wkt.parse(track.end_point);
	trackLine.setStyle(function (feature) {return {color: palette[0]}});
	//Rotate array by one element
	palette.push(palette[0]);
	palette.shift();
	var completeTrack = L.layerGroup([trackLine, trackStart, trackEnd]);
	completeTrack.addTo(map);
	shownTracks[id] = completeTrack;
};

function removeTrackFromMap(map, id) {
	var layer = shownTracks[id];
	console.log(map.hasLayer(layer));
	if (map.hasLayer(layer)) {
		map.removeLayer(layer);
		delete shownTracks[id];
	};
};
