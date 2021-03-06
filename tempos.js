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
BCKUPINTERVAL = 3600 * 5;

app.set('port',  8080);
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))

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

function InstitutionFile(institutionId, cb) {
	var self = this;
	this.id = institutionId;
	this.path = __dirname + "/instituiton-" + institutionId +".json";
	this.error = false;
	this.loaded = false;
	this._onloadedcalls = [];
	this.content = {
		'entries':[]
	};
	this.onload = function(callback){
		self._onloadedcalls.push(callback);
	}
	this.loadFile = function (exists){
		if (exists){
			console.log("The path is :")
			console.log(self.path)
			fs.readFile(self.path, "utf8", function(err, data){
				if (err){
					self.error = true;
					self.loaded = true;
					for(fun in self._onloadedcalls){
						self._onloadedcalls[fun]();
					}
					console.log("Error loading JSON File (InstitutionFile Constructor)")
				} else {
					self.content = JSON.parse(data);
					self.loaded = true;
					for(fun in self._onloadedcalls){
						self._onloadedcalls[fun]();
					}
				}
			});
		}
		else {
			self.loaded = true;
			for(fun in self._onloadedcalls){
				self._onloadedcalls[fun]();
			}
		}
	};
	
	this.save = function (){
		writeJsonFile(self.content, self.path);
	};
	
	this.addEntry = function(entry){
		self.content.entries.push(entry);
	}
	this.onload(cb);
	fs.exists(this.path, this.loadFile);
}

function genBackup(){
	var bckupname = (new Date()).getTime()
	console.log("Making a new backup named " + bckupname);
	exec("mkdir " + __dirname + "/bkup/" + bckupname);
	for (key in INSTITUICOES){
		exec("cp " + __dirname + "/instituiton-"+key+".json " + __dirname + "/bkup/" + bckupname + "/instituiton-"+key+".json");
	}
	console.log("Backup is completed");
}

function parseData(id){
	var ins = new InstitutionFile(id, function(){
		request(BASE_URL + id, function(error, response, data){
			if(!error){
				try {
					data = JSON.parse(data);
					for (i in data.Result) {
						var entry = new Entry();
						var dados = dados = data.Result[i]
						
						entry.entryDate = dados.LastUpdate;
						entry.gatherDate = (new Date()).getTime();
						
						entry.data.emergency.code = dados.Emergency.Code;
						entry.data.emergency.name = dados.Emergency.Description;
							
						if (data.Result[i].Queue != null) {		
							entry.data.queue.code = dados.Queue.Code;
							entry.data.queue.name = dados.Queue.Description;
							
						} else {
							entry.data.queue.code = false;
							entry.data.queue.name = 'Geral';
						}
						
						entry.data.colors.red['queue-length'] = dados.Red.Length;
						entry.data.colors.red['queue-time'] = dados.Red.Time;
						entry.data.colors.orange['queue-length'] = dados.Orange.Length;
						entry.data.colors.orange['queue-time'] = dados.Orange.Time;
						entry.data.colors.yellow['queue-length'] = dados.Yellow.Length;
						entry.data.colors.yellow['queue-time'] = dados.Yellow.Time;
						entry.data.colors.green['queue-length'] = dados.Green.Length;
						entry.data.colors.green['queue-time'] = dados.Green.Time;
						entry.data.colors.blue['queue-length'] = dados.Blue.Length;
						entry.data.colors.blue['queue-time'] = dados.Blue.Time;
						
						ins.addEntry(entry);
					}
					ins.save();
			} catch(error) {
				console.log(error)
			}
			}
			else { 
				console.log("Error gathering data (tempos.js): " + id)
				console.log(error); 
			}
		})
	});
}

var instcount = 0;
var insttimediff = 1000;
for (key in INSTITUICOES){
	parseData(key);
	console.log('gathered '+key)
	setInterval(parseData, INTERVALO_TEMPO, key);
	instcount++;
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res){
	res.render('home', {'institutions':INSTITUICOES, 'inst-ids':Object.keys(INSTITUICOES)});
	console.log(Object.keys(INSTITUICOES))
})

app.get('/excel/:instid', function(req, res){
	rid = Math.round(Math.random()*10000)
	filename = "output-" + rid + ".xlsx"
	function puts(error, stdout, stderr) {
		if (error){
			console.log("Error in puts!\n");
			console.log(stderr);
			console.log("STDOUT:\n")
			console.log(stdout);
			res.send("Oops, something went wrong!");
		} else {
			console.log(stdout);
			res.setHeader('Content-disposition', 'attachment; filename=registoTemposSNS'+req.params.instid+'.xlsx');
			res.sendFile(__dirname + "/export-xls/" + filename);
			setTimeout(function(){exec("rm " + __dirname + "/export-xls/" + filename)}, 10000);
		}
	}
	exec("python " + __dirname + "/export-xls/export.py " +  req.params.instid + " " + filename, puts);
})

setInterval(genBackup, BCKUPINTERVAL*1000)
process.on( 'SIGINT', function() {
  console.log( "\n Shuting down tempos-sns... Please wait." );
  genBackup();
  setTimeout(process.exit, 1000);
})
