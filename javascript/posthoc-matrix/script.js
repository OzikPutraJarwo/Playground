let valueBNJH;

function hitungBNJ() {
	const inputPerlakuan = document.querySelector('#input-perlakuan').value;
	const inputUlangan = document.querySelector('#input-ulangan').value;
	const inputKTG = document.querySelector('#input-ktg').value;

	const valueDBG = (inputPerlakuan - 1) * (inputUlangan - 1);
	const valueSD = Math.sqrt(inputKTG / inputUlangan);
	const valueBNJT = jStat.tukey.inv(0.95, inputPerlakuan, valueDBG);
	valueBNJH = valueSD * valueBNJT;

	const outputSD = document.querySelector('.output-sd');
	const outputBNJT = document.querySelector('.output-bnjt');
	const outputBNJH = document.querySelector('.output-bnjh');

	outputSD.innerHTML = valueSD;
	outputBNJT.innerHTML = valueBNJT;
	outputBNJH.innerHTML = valueBNJH;
}

let dataMap;

function processData() {
	const input = document.getElementById('inputData').value.trim();
	const lines = input.split('\n');
	dataMap = {};

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
		row.innerHTML = `<th>${perlakuanA}</th>`;

		sortedEntries.forEach(([perlakuanB, nilaiB]) => {
			const difference = (nilaiA - nilaiB).toFixed(5);
			if (difference <= valueBNJH && difference >= 0) {
				row.innerHTML += `<td class="green">${difference}</td>`;
			} else {
				row.innerHTML += `<td>${difference}</td>`;
			}
		});

		matrixTableBody.appendChild(row);
	});

	// Ambil elemen tabel
	const table = document.getElementById('matrixTable');
	const rows = table.querySelectorAll('tbody tr');

	// Inisialisasi objek untuk menyimpan hasil
	const results = {};

	// Loop melalui setiap baris (mulai dari indeks 1 untuk mengabaikan header)
	rows.forEach((row, rowIndex) => {
		if (rowIndex === 0) return; // Lewati baris pertama (header)

		// Ambil nama perlakuan dari kolom pertama
		const treatmentName = row.querySelector('th').textContent.trim();

		// Inisialisasi array untuk menyimpan kolom yang memiliki kelas .green
		const greenColumns = [];

		// Loop melalui setiap sel dalam baris
		const cells = row.querySelectorAll('td');
		cells.forEach((cell, cellIndex) => {
			// Jika sel memiliki kelas .green, simpan indeks kolom
			if (cell.classList.contains('green')) {
				greenColumns.push(cellIndex + 1); // Tambahkan 1 untuk indeks berbasis 1
			}
		});

		// Simpan hasil ke dalam objek
		results[treatmentName] = greenColumns.join(',');
	});

	const labelMap = {};
	const assigned = {};
	let currentLabelCode = 'a'.charCodeAt(0);

	// Helper untuk cari key yang punya angka tertentu
	function keysWithNumber(num) {
		return Object.keys(results).filter(key =>
			results[key].split(',').includes(String(num))
		);
	}

	for (const key of Object.keys(results)) {
		const nums = results[key].split(',');
		const first = nums[0];

		if (!labelMap[first]) {
			const label = String.fromCharCode(currentLabelCode++);
			labelMap[first] = label;

			const relatedKeys = keysWithNumber(first);
			for (const rk of relatedKeys) {
				assigned[rk] = (assigned[rk] || '') + label;
			}
		}
	}

	const merged = {};

	for (const key in assigned) {
		merged[key] = {
			label: assigned[key],
			value: dataMap[key]
		};
	}

	// Simpan urutan key berdasarkan key dataMap (M0, M1, ..., M6)
	const dataMapKeyOrder = Object.keys(dataMap);

	// Simpan urutan default merged (misalnya dari input awal)
	const mergedCustomOrder = Object.keys(merged);

	function renderTable(orderBy = 'dataMapKey') {
		const tbody = document.querySelector("#letterTable tbody");
		tbody.innerHTML = "";

		let sortedKeys;

		if (orderBy === 'merged') {
			sortedKeys = mergedCustomOrder;
		} else if (orderBy === 'dataMapKey') {
			sortedKeys = dataMapKeyOrder.filter(k => merged[k]); // hanya yang ada di merged
		}

		sortedKeys.forEach(key => {
			const row = document.createElement("tr");

			const tdKey = document.createElement("td");
			tdKey.textContent = key;

			const tdValue = document.createElement("td");
			tdValue.textContent = merged[key].value.toFixed(5);

			const tdLabel = document.createElement("td");
			tdLabel.textContent = merged[key].label;

			row.appendChild(tdKey);
			row.appendChild(tdValue);
			row.appendChild(tdLabel);

			tbody.appendChild(row);
		});
	}

	renderTable('merged');

	document.getElementById('renderbyData').onclick = function () {
		renderTable('merged');
	}
	document.getElementById('renderbyData').onclick = function () {
		renderTable('dataMapKey');
	}

	document.getElementById('letter').innerHTML = JSON.stringify(merged);
	document.getElementById('letter').innerHTML += JSON.stringify(dataMap);

}