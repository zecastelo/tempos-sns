# tempos-sns

O tempos-sns recolhe dados do Serviço Nacional Saude. Mais concretamente recolhe dados sobre as urgências (tempos e filas de espera). 
Os dados são recolhidos de todas as instituições aderentes mas existem instituições cujos dados nem sempre estão disponiveis.

REQUISITOS:

1. Qualquer sistema UNIX.
2. Node.js (Versão mais actual) e Python (2.7) (com dependencia da livraria XslxWriter)

UTILIZAÇÃO:

1. Fazer o download deste repositório.
2. Abrir um terminal na pasta.
4. Instalar as dependencias do Node.js (comando "npm install").
3. Correr no terminal o commando "node tempos.js".
(4.) O servidor fará backups dos ficheiros com a informação a cada intervalo de tempo (variavel BCKUPINTERVAL, em segundos)

Para receber os dados em formato .xlsx (ficheiro Excel) basta aceder a /excel/#instituição e o download será feito. Alternativamente, na homepage há ainda uma lista de todas as instituições.


José Castelo, 2016 (jbcastelo@hotmail.com)