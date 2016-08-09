URL = "http://tempos.min-saude.pt/api.php/standbyTime/211";
INTERVALO_TEMPO = 3600/2 * 1000;

var fs = require('fs');
var request = require('request');
var express = require('express');
var http = require('http');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var app     = express();

app.set('port',  8080);


function parseData(){
	request(URL, function(error, response, data){

        if(!error){
			data = JSON.parse(data);
			for (i in data.Result) {
				var logtext = "";
				if (data.Result[i].Queue != null) {
					var dados = dados = data.Result[i]
					logtext += data.Result[i].Queue.Description + " >> ";
					logtext += dados.LastUpdate+"\t";
					logtext += " R-"+dados.Red.Time+"-"+dados.Red.Length+"\t";
					logtext += " O-"+dados.Orange.Time+"-"+dados.Orange.Length+"\t";
					logtext += " Y-"+dados.Yellow.Time+"-"+dados.Yellow.Length+"\t";
					logtext += " G-"+dados.Green.Time+"-"+dados.Green.Length+"\t";
					logtext += " B-"+dados.Blue.Time+"-"+dados.Blue.Length;
					logtext += "\n"
				} else {
					var dados = dados = data.Result[i]
					logtext += "Geral" + " >> ";
					logtext += dados.LastUpdate+"\t";
					logtext += " R-"+dados.Red.Time+"-"+dados.Red.Length+"\t";
					logtext += " O-"+dados.Orange.Time+"-"+dados.Orange.Length+"\t";
					logtext += " Y-"+dados.Yellow.Time+"-"+dados.Yellow.Length+"\t";
					logtext += " G-"+dados.Green.Time+"-"+dados.Green.Length+"\t";
					logtext += " B-"+dados.Blue.Time+"-"+dados.Blue.Length;
					logtext += "\n"
				}
				var filepath = __dirname + '/registoTempos'
				fs.appendFile(filepath, logtext, function (err) {console.log(err)});
			}
        }
		else { 
			console.log(error); 
		}
    })
}


parseData();
setInterval(parseData, INTERVALO_TEMPO);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res){
	function puts(error, stdout, stderr) {
		if (error){
			console.log(stderr);
			res.send(stderr);
		} else {
			res.setHeader('Content-disposition', 'attachment; filename=registoTemposSNS211.xlsx');
			res.sendFile(__dirname + "/export-xls/output.xlsx", "registoTempos.xlsx");
		}
	}
	exec("python " + __dirname + "/export-xls/export.py", puts);
})

