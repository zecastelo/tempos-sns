# Export data from flattextfile to xls.
import xlsxwriter

INPUT_FILE_PATH = "./input"
MODEL_FILE_PATH = "./output.xlsx"
cols_per_category = 14
names = ['Medicina Int', 'Cirurgia Geral', 'Oftalmologia', 'Ortopedia', 'Otorrino', 'Pequena Cirurgia', 'Geral']
file = open(INPUT_FILE_PATH, "r")
lines = file.readlines()
wb = xlsxwriter.Workbook(MODEL_FILE_PATH)
worksheet = wb.add_worksheet('Dados')
formats = [wb.add_format(), wb.add_format(), wb.add_format(), wb.add_format(), wb.add_format()]

formats[0].set_bg_color('red');
formats[1].set_bg_color('orange');
formats[2].set_bg_color('yellow');
formats[3].set_bg_color('green');
formats[4].set_bg_color('blue');



rows = [2, 2, 2, 2, 2, 2, 2];

for i in range(7):
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
	for a in range(5):
		worksheet.write(1, col, '#Doentes', formats[a])
		col += 1
		worksheet.write(1, col, 'Tempo (s)', formats[a])
		col += 1
	
for line in lines:
	line_split = line.split()
	col_multiplier = 0
	info = [];
	if line_split[0] == 'Espera:':
		if line_split[1] == 'Otorrino':
			info = line_split[3:]
			col_multiplier = 4
		elif line_split[1] == 'Ortopedia':
			info = line_split[3:]
			col_multiplier = 3
		elif line_split[1] == 'Oftalmologia':
			info = line_split[3:]
			col_multiplier = 2
		elif line_split[1] == 'Medicina' and line_split[2] == 'Int.':
			info = line_split[4:]
			col_multiplier = 0
		elif line_split[1] == 'Peq.' and line_split[2] == 'Cirurgia':
			info = line_split[4:]
			col_multiplier = 5
		elif line_split[1] == 'Cirurgia' and line_split[2] == 'Geral':
			info = line_split[4:]
			col_multiplier = 1
	elif line_split[0] == 'Geral':
		info = line_split[2:]
		col_multiplier = 6
		
	col = col_multiplier * cols_per_category;
	row = rows[col_multiplier];
	# Column order is as follows: 	DateYear(yyyy), DateMonth(mm), DateDay (dd), RedPacientsNum, RedPacientsTime, 
	#							 	OrangePacientsNum, OrangePacientsTime, YellowPacientsNum, YellowPacientsTime, 
	#								GreenPacientsNum, GreenPacientsTime, BluePacientsNum, BluePacientsTime.
	
	for i, item in enumerate(info):
		if i == 0:
			(date, time) = item.split('T')
			(year, month, day) = date.split('-')
			worksheet.write(row, col, year)
			col+=1
			worksheet.write(row, col, month)
			col+=1
			worksheet.write(row, col, day)
			col+=1
			worksheet.write(row, col, time)
			col+=1
		else:
			(color, wait_time, count) = item.split('-')
			worksheet.write(row, col, count)
			col+=1
			worksheet.write(row, col, wait_time)
			col+=1
	rows[col_multiplier]+=1;
	print(info)
	
file.close()
wb.close();