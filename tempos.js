BASE_URL = "http://tempos.min-saude.pt/api.php/standbyTime/";
INTERVALO_TEMPO = 3600/2 * 1000;

var fs = require('fs');
var request = require('request');
var express = require('express');
var http = require('http');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var app     = express();
var INSTITUICOES = require('./instituicoes.js')

app.set('port',  8080);


function parseData(id){
	request(BASE_URL + id, function(error, response, data){
        if(!error){
			data = JSON.parse(data);
			if (!('Result' in data)) {
				fs.appendFile(filepath, "", function (err) {if (err){console.log("Error append file (tempos.js): ");console.log(err)}});
			}
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
				var filepath = __dirname + '/registoTempos-'+id
				fs.appendFile(filepath, logtext, function (err) {if (err){console.log("Error append file (tempos.js): ");console.log(err)}});
			}
        }
		else { 
			console.log("Error gathering data (tempos.js): " + id)
			console.log(error); 
		}
    })
}

var instcount = 0;
var insttimediff = 1000;
for (key in INSTITUICOES){
	parseData(key);
	console.log('gathered '+key)
	setTimeout(function(){setInterval(parseData, INTERVALO_TEMPO, key);}, insttimediff * instcount)
	instcount++;
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/:instId', function(req, res){
	function puts(error, stdout, stderr) {
		if (error){
			console.log(stderr);
			res.send("Oops, something went wrong!");
		} else {
			res.setHeader('Content-disposition', 'attachment; filename=registoTemposSNS'+req.params.instId+'.xlsx');
			res.sendFile(__dirname + "/export-xls/output.xlsx");
		}
	}
	console.log(req.params.instId);
	exec("python " + __dirname + "/export-xls/export.py " +  req.params.instId, puts);
})

