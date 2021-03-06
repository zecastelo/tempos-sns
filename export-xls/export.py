#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Export data from flattextfile to xls.
import xlsxwriter
import os
import sys
import codecs
import time
import json

SCRIPT_DIR = os.path.dirname(__file__)
INPUT_FILE_PATH = "../instituiton-"+str(sys.argv[1])+".json"
OUTPUT_FILE_PATH = str(sys.argv[2])
cols_per_category = 16
names = []
data = False

f = codecs.open(os.path.join(SCRIPT_DIR, INPUT_FILE_PATH), 'r', 'utf-8')   
data = json.load(f)
for i in range(len(data[u'entries'])):
	entry_data = data[u'entries'][i]['data']
	name = entry_data['emergency'][u'name'] + " - " + entry_data[u'queue'][u'name']
	if name not in names:
		names.append(name)

wb = xlsxwriter.Workbook(os.path.join(SCRIPT_DIR, OUTPUT_FILE_PATH))
worksheet = wb.add_worksheet('Dados')
formats = 	{	'red':wb.add_format(), 
				'orange':wb.add_format(), 
				'yellow':wb.add_format(), 
				'green':wb.add_format(), 
				'blue':wb.add_format()
			}

formats['red'].set_bg_color('red');
formats['orange'].set_bg_color('orange');
formats['yellow'].set_bg_color('yellow');
formats['green'].set_bg_color('green');
formats['blue'].set_bg_color('blue');



rows = [2 for i in range(len(names))]

for i in range(len(names)):
	worksheet.write(0, i*cols_per_category, names[i])
	col = cols_per_category * i
	worksheet.write(1, col, 'Ano')
	col += 1
	worksheet.write(1, col, 'Mes')
	col += 1
	worksheet.write(1, col, 'Dia')
	col += 1
	worksheet.write(1, col, 'Hora')
	col += 1
	worksheet.write(1, col, 'EPOCH')
	col += 1
	worksheet.write(1, col, 'DateStamp')
	col += 1
	for a in ['red', 'orange', 'yellow', 'green', 'blue']:
		worksheet.write(1, col, '#Doentes', formats[a])
		col += 1
		worksheet.write(1, col, 'Tempo (s)', formats[a])
		col += 1
	
LASTINFO = [0 for i in range(len(names))]
for i, e in enumerate(data['entries']):
	name = e['data']['emergency']['name'] + " - " + e['data']['queue']['name']
	col_multiplier = names.index(name);	
	col = col_multiplier * cols_per_category;
	row = rows[col_multiplier];
	# Column order is as follows: 	DateYear(yyyy), DateMonth(mm), DateDay (dd), RedPacientsNum, RedPacientsTime,    OUTDATED FIXME
	#							 	OrangePacientsNum, OrangePacientsTime, YellowPacientsNum, YellowPacientsTime, 
	#								GreenPacientsNum, GreenPacientsTime, BluePacientsNum, BluePacientsTime.
	entry = data['entries'][i]
	entry_data = entry['data']
	if entry['entryDate'] != LASTINFO[col_multiplier]:
		(date, tm) = entry['entryDate'].split('T')
		(year, month, day) = date.split('-')
		tm = tm.split('.')[0];
		worksheet.write(row, col, year)
		col+=1
		
		worksheet.write(row, col, month)
		col+=1
		
		worksheet.write(row, col, day)
		col+=1
		
		worksheet.write(row, col, tm)
		col+=1
		
		timestr = day+"/"+month+"/"+year+" "+tm
		pattern = '%d/%m/%Y %H:%M:%S'
		epoch = int(time.mktime(time.strptime(timestr, pattern)))
		worksheet.write(row, col, epoch)
		col+=1
		
		worksheet.write(row, col, timestr)
		col+=1
		
		for a in entry_data['colors'].keys():
			num_patients = entry_data['colors'][a]['queue-length']
			wait_time = entry_data['colors'][a]['queue-time']

			worksheet.write(row, col, num_patients)
			col+=1
			worksheet.write(row, col, wait_time)
			col+=1
		
		rows[col_multiplier]+=1;	
		LASTINFO[col_multiplier] = entry['entryDate']
	
f.close()
wb.close();