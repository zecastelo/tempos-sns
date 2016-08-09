URL = "http://tempos.min-saude.pt/api.php/standbyTime/211";
INTERVALO_TEMPO = 3600/2 * 1000;

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
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
				fs.appendFile('registoTempos', logtext, function (err) {});
			}
        }
    })
}


parseData();
setInterval(parseData, INTERVALO_TEMPO);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res){
	res.send('Hello bruno, have a jolly good time!');
	console.log('Heya!')
	res.download(process.env.OPENSHIFT_DATA_DIR+"registoTempos");
})

