# Export data from flattextfile to xls.
import xlsxwriter
import os
import sys

SCRIPT_DIR = os.path.dirname(__file__)
INPUT_FILE_PATH = "../registoTempos-"+sys.argv[1]
OUTPUT_FILE_PATH = "output.xlsx"
cols_per_category = 15
names = []
file = open(os.path.join(SCRIPT_DIR, INPUT_FILE_PATH), "r")
lines = file.readlines()


for line in lines:
	(name, info) == line.split('>>')
	if name not in names:
		names.append(name)
	else:
		break


wb = xlsxwriter.Workbook(os.path.join(SCRIPT_DIR, OUTPUT_FILE_PATH))
worksheet = wb.add_worksheet('Dados')
formats = [wb.add_format(), wb.add_format(), wb.add_format(), wb.add_format(), wb.add_format()]

formats[0].set_bg_color('red');
formats[1].set_bg_color('orange');
formats[2].set_bg_color('yellow');
formats[3].set_bg_color('green');
formats[4].set_bg_color('blue');



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
	for a in range(5):
		worksheet.write(1, col, '#Doentes', formats[a])
		col += 1
		worksheet.write(1, col, 'Tempo (s)', formats[a])
		col += 1
	
LASTINFO = [0 for i in range(len(names))]
for i, line in enumerate(lines):
	line_split = line.split()
	(name, infox) = line.split('>>');
	col_multiplier = names.index(name);
	info = infox.split();
		
	col = col_multiplier * cols_per_category;
	row = rows[col_multiplier];
	# Column order is as follows: 	DateYear(yyyy), DateMonth(mm), DateDay (dd), RedPacientsNum, RedPacientsTime, 
	#							 	OrangePacientsNum, OrangePacientsTime, YellowPacientsNum, YellowPacientsTime, 
	#								GreenPacientsNum, GreenPacientsTime, BluePacientsNum, BluePacientsTime.
	
	if info != LASTINFO[col_multiplier]:
		for i, item in enumerate(info):
			if i == 0:
				(date, time) = item.split('T')
				(year, month, day) = date.split('-')
				time = time.split('.')[0];
				worksheet.write(row, col, year)
				col+=1
				worksheet.write(row, col, month)
				col+=1
				worksheet.write(row, col, day)
				col+=1
				worksheet.write(row, col, time)
				col+=1
				worksheet.write(row, col, 0) #FIXME ESCREVER O TEMPO EM EPOCH
				col+=1
			else:
				(color, wait_time, count) = item.split('-')
				worksheet.write(row, col, count)
				col+=1
				worksheet.write(row, col, wait_time)
				col+=1
		rows[col_multiplier]+=1;
		LASTINFO[col_multiplier] = info
	
file.close()
wb.close();