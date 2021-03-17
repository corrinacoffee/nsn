const path = require('path');
const mysql = require('mysql');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 80;

app.engine('.html', require('ejs').__express);

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'html');

app.get('/favicon.ico', (req, res) => {
	res.sendFile('/var/www/html/nsn/favicon.ico');
});

app.get('/style.css', (req, res) => {
	res.sendFile('/var/www/html/nsn/style.css');
});

var username = '';
var pass = '';
fs.readFile('/var/www/html/mysql_root_pw.txt', 'utf8', (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	var split = data.split('\n');
	username = split[0].trim();
	pass = split[1].trim();
});

app.get('/:nsn', (req, res) => {

	var connection = mysql.createConnection({
		multipleStatements: true,
		host: 'localhost',
		user: username,
		password: pass,
		database: 'aerobasegroup'
	});

	connection.connect();

	connection.query("SET @search = ?; SET @trimmed = SUBSTR(@search, 6, 11); SET @replaced = REPLACE(@trimmed, '-', ''); SET @converted = CONVERT(@replaced, INT); select * from nsn as a join nsn_flis_parts as b on b.niin = a.niin where a.niin=@converted;",
		[req.params.nsn],
		function (err, rows, fields) {
			if (err) throw err
			res.render('index', {
				nsn: req.params.nsn,
				data: rows[4]
			});
		});

	connection.end();
});

app.use(function(req, res, next) {
	res.render('index', {
		nsn: 'XXXX-XX-XXX-XXXX',
		data: []
	});
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});


