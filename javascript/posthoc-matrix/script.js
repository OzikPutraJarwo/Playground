function processData() {
    const input = document.getElementById('inputData').value.trim();
    const lines = input.split('\n');
    const dataMap = {};

    // Proses input untuk menghitung rata-rata
    lines.forEach(line => {
        const [perlakuan, nilai] = line.split('\t');
        const nilaiFloat = parseFloat(nilai);
        dataMap[perlakuan] = nilaiFloat;
    });

    // Urutkan data dari yang terkecil ke yang terbesar
    const sortedEntries = Object.entries(dataMap).sort((a, b) => a[1] - b[1]);
    
    // Hasilkan JSON
    const jsonOutput = JSON.stringify(sortedEntries, null, 2);
    // document.getElementById('jsonOutput').textContent = jsonOutput;

    // Buat tabel matriks
    const matrixTableBody = document.querySelector('#matrixTable tbody');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th></th>' + sortedEntries.map(entry => `<th>${entry[0]}</th>`).join('');
    matrixTableBody.innerHTML = ''; // Kosongkan tabel sebelumnya
    matrixTableBody.appendChild(headerRow);

    // Tambahkan baris untuk setiap perlakuan
    sortedEntries.forEach(([perlakuanA, nilaiA]) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${perlakuanA}</td>`;
        
        sortedEntries.forEach(([perlakuanB, nilaiB]) => {
            const difference = (nilaiA - nilaiB).toFixed(5);
            row.innerHTML += `<td>${difference}</td>`;
        });
        
        matrixTableBody.appendChild(row);
    });
}

function hitungBNJ(){
  const inputPerlakuan = document.querySelector('#input-perlakuan').value;
  const inputUlangan = document.querySelector('#input-ulangan').value;
  const inputKTG = document.querySelector('#input-ktg').value;

  const valueDBG = (inputPerlakuan - 1) * (inputUlangan - 1);

  const outputSD = document.querySelector('.nilai-sd');
  const outputBNJT = document.querySelector('.output-bnjt');
  const outputBNJH = document.querySelector('.output-bnjh');

  outputSD.innerHTML = Math.sqrt(inputKTG / inputUlangan);
}