var fs = require('fs');
var request = require('request');
var express = require('express');
var http = require('http');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var app     = express();
var INSTITUICOES = require('./instituicoes.js')

BASE_URL = "http://tempos.min-saude.pt/api.php/standbyTime/";
INTERVALO_TEMPO = 3600/2 * 1000;
app.set('port',  8080);

function Entry(){
	this.entryDate = 0;
	this.gatherDate = 0;
	this.error = false;
	this.errorType = 0;
	this.data = {
		"emergency" : {
			"code" : "",
			"name" : ""
		},	
		"queue" : {
			"code" : "",
			"name" : ""
		},		
		"colors" : {
			"red" : {
				"queue-length" : 0,
				"queue-time" : 0
			},
			"orange" : {
				"queue-length" : 0,
				"queue-time" : 0
			},
			"yellow" : {
				"queue-length" : 0,
				"queue-time" : 0
			},
			"green" : {
				"queue-length" : 0,
				"queue-time" : 0
			},
			"blue" : {
				"queue-length" : 0,
				"queue-time" : 0
			}
		}
	};
}

function writeJsonFile(object, filepath){
	fs.writeFileSync(filepath, JSON.stringify(object));
}

function InstitutionFile(institutionId) {
	var self = this;
	this.id = institutionId;
	this.path = __dirname + "/instituiton-" + institutionId +".json";
	this.error = false;
	this.loaded = false;
	this.content = {
		'entries':[]
	};
	
	this.loadFile = function (exists){
		if (exists){
			console.log("The path is :")
			console.log(self.path)
			fs.readFile(self.path, "utf8", function(err, data){
				if (err){
					self.error = true;
					self.loaded = true;
					console.log("Error loading JSON File (InstitutionFile Constructor)")
				} else {
					self.content = JSON.parse(data);
					self.loaded = true;
				}
			});
		}
		else {
			self.loaded = true;
		}
	}
	
	this.save = function (){
		writeJsonFile(self.content, self.path);
	}
	
	fs.exists(this.path, this.loadFile);
}

a = new InstitutionFile(211);

a.save();

function parseData(id){
	request(BASE_URL + id, function(error, response, data){
		var filepath = __dirname + '/registoTempos-'+id
        if(!error){
			try {
				data = JSON.parse(data);
				for (i in data.Result) {
					var logtext = "";
					if (data.Result[i].Queue != null) {
						var dados = dados = data.Result[i]
						logtext += data.Result[i].Emergency.Description + " - " + data.Result[i].Queue.Description + " >> ";
						logtext += dados.LastUpdate+"\t";
						logtext += " R-"+dados.Red.Time+"-"+dados.Red.Length+"\t";
						logtext += " O-"+dados.Orange.Time+"-"+dados.Orange.Length+"\t";
						logtext += " Y-"+dados.Yellow.Time+"-"+dados.Yellow.Length+"\t";
						logtext += " G-"+dados.Green.Time+"-"+dados.Green.Length+"\t";
						logtext += " B-"+dados.Blue.Time+"-"+dados.Blue.Length;
						logtext += "\n"
					} else {
						var dados = dados = data.Result[i]
						logtext += data.Result[i].Emergency.Description + " - " +  "Geral" + " >> ";
						logtext += dados.LastUpdate+"\t";
						logtext += " R-"+dados.Red.Time+"-"+dados.Red.Length+"\t";
						logtext += " O-"+dados.Orange.Time+"-"+dados.Orange.Length+"\t";
						logtext += " Y-"+dados.Yellow.Time+"-"+dados.Yellow.Length+"\t";
						logtext += " G-"+dados.Green.Time+"-"+dados.Green.Length+"\t";
						logtext += " B-"+dados.Blue.Time+"-"+dados.Blue.Length;
						logtext += "\n"
					}
					
					fs.appendFile(filepath, logtext, function (err) {if (err){console.log("Error append file (tempos.js): ");console.log(err)}});
				}
		} catch(error) {
			console.log(error)
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

