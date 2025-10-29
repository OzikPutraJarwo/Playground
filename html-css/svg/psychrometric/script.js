let ptot = 101.325; // kPa
let T, W, pw, pws, phi, Ws, mu, Tdew, Twb, h, v;

const inputs = document.querySelectorAll('#x-input, #y-input');
inputs.forEach(input => input.addEventListener('input', () => {
  // Marker X axis
  const xValue = 45.38709677419355 * Number(document.getElementById('x-input').value) + 715.8064516129032;
  document.querySelector('.input-marker').setAttribute('cx', xValue);
  // Marker Y axis
  const yValue = -80.15384615384616 * Number(document.getElementById('y-input').value) + 2144;
  document.querySelector('.input-marker').setAttribute('cy', yValue);
  // Calculate parameters
  calculate(Number(document.getElementById('x-input').value), Number(document.getElementById('y-input').value), '.input');
}));

function calculate(xValue, yValue, container) {

  // Dry Bulb Temperature (T)
  T = xValue; // °C

  // Humidity Ratio (W)
  W = yValue / 1000; // kg/kg

  // Vapor Pressure (pw)
  pw = (W * ptot) / (0.622 + W); // kPa

  // Saturation Vapor Pressure (pws[T])
  pws = 0.61094 * Math.exp((17.625 * T) / (T + 243.04)); // kPa

  // Relative Humidity (ϕ)
  phi = pw / pws; // %

  // Saturation Humidity Ratio
  Ws = 0.622 * pws / (ptot - pws); // (kg/kgda)

  // Degree of Saturation (μ)
  mu = W / Ws; // %

  // Dew Point Temperature (Tdew)
  Tdew = (243.04 * Math.log(pw / 0.61094)) / (17.625 - Math.log(pw / 0.61094)); // °C

  // Wet Bulb Temperature (Twb)
  function pws_magnus(T) {
    // T in °C -> returns kPa
    return 0.61094 * Math.exp((17.625 * T) / (T + 243.04));
  }
  function Ws_from_T(T, p_kpa) {
    const pws = pws_magnus(T);
    return 0.622 * pws / (p_kpa - pws);
  }
  function Wcalc_from_Twb(T, Twb, p_kpa) {
    // T, Twb in °C, p in kPa
    const WsTwb = Ws_from_T(Twb, p_kpa);
    const num = (2501 - 2.326 * Twb) * WsTwb - 1.006 * (T - Twb);
    const den = 2501 + 1.86 * T - 4.186 * Twb;
    return num / den; // kg/kg dry air
  }
  function dew_point_from_pw(pw_kpa) {
    // invert Magnus approximate quickly (valid for typical range)
    // pw_kpa must be > 0
    return (243.04 * Math.log(pw_kpa / 0.61094)) / (17.625 - Math.log(pw_kpa / 0.61094));
  }
  function findTwb_bisection(T, W_given, p_kpa, tol = 1e-6, maxIter = 100) {
    // compute pw from W
    const pw = (W_given * p_kpa) / (0.622 + W_given);
    // dew point as lower bound (safe)
    let a = dew_point_from_pw(pw);
    let b = T; // upper bound
    // ensure f(a) and f(b) have opposite signs
    let fa = Wcalc_from_Twb(T, a, p_kpa) - W_given;
    let fb = Wcalc_from_Twb(T, b, p_kpa) - W_given;
    // if no sign change, expand bounds a bit or fail gracefully
    if (!(fa * fb <= 0)) {
      // fallback: try slightly below dew and slightly above T
      a = Math.min(a, T - 100);
      b = Math.max(b, T + 5);
      fa = Wcalc_from_Twb(T, a, p_kpa) - W_given;
      fb = Wcalc_from_Twb(T, b, p_kpa) - W_given;
      if (fa * fb > 0) {
        throw new Error('Bisection sign check failed; check inputs or formula (freezing case?)');
      }
    }
    let mid = (a + b) / 2;
    let fmid = Wcalc_from_Twb(T, mid, p_kpa) - W_given;
    let iter = 0;
    while ((Math.abs(fmid) > tol) && (iter < maxIter) && ((b - a) / 2 > 1e-7)) {
      if (fa * fmid <= 0) {
        b = mid;
        fb = fmid;
      } else {
        a = mid;
        fa = fmid;
      }
      mid = (a + b) / 2;
      fmid = Wcalc_from_Twb(T, mid, p_kpa) - W_given;
      iter++;
    }
    // return { Twb: mid, iterations: iter, residual: fmid };
    return mid;
  }
  Twb = findTwb_bisection(T, W, ptot); // °Cinfomarker

  // Specific Enthalpy (h)
  h = 1.006 * T + W * (2501 + 1.86 * T); // kg dry air

  // Specific Volume (v)
  v = 0.287042 * (T + 273.15) * (1 + 1.6078 * W) / ptot; // m³/kgda

  // Moist Air Density (ρ)
  p = (1 + W) / v; // kg/m³

  // Display results
  document.querySelector(container).innerHTML = `
    <div><span>Dry Bulb Temperature (Tdb)</span><span>:</span><span>${T.toFixed(2)}</span><span>°C</span></div>
    <div><span>Humidity Ratio (W)</span><span>:</span><span>${W.toFixed(6)}</span><span>kg<sub>w</sub>/kg<sub>da</sub></span></div>
    <div><span>Vapor Pressure (pw)</span><span>:</span><span>${pw.toFixed(4)}</span><span>kPa</span></div>
    <div><span>Saturation Vapor Pressure (pws)</span><span>:</span><span>${pws.toFixed(4)}</span><span>kPa</span></div>
    <div><span>Relative Humidity (ϕ)</span><span>:</span><span>${(phi * 100).toFixed(2)}</span><span>%</span></div>
    <div><span>Saturation Humidity Ratio (Ws)</span><span>:</span><span>${Ws.toFixed(6)}</span><span>kg/kg</span></div>
    <div><span>Degree of Saturation (μ)</span><span>:</span><span>${(mu * 100).toFixed(2)}</span><span>%</span></div>
    <div><span>Dew Point Temperature (Tdew)</span><span>:</span><span>${Tdew.toFixed(2)}</span><span>°C</span></div>
    <div><span>Wet Bulb Temperature (Twb)</span><span>:</span><span>${Twb.toFixed(2)}</span><span>°C</span></div>
    <div><span>Specific Enthalpy (h)</span><span>:</span><span>${h.toFixed(2)}</span><span>kJ/kg</span></div>
    <div><span>Specific Volume (v)</span><span>:</span><span>${v.toFixed(4)}</span><span>m³/kg</span></div>
    <div><span>Moist Air Density (ρ)</span><span>:</span><span>${p.toFixed(4)}</span><span>kg/m³</span></div>
  `;

}

const graphOutline = document.querySelector('.graph-outline');
const marker = document.querySelector('.moving-marker');
const fixedMarkerGroup = document.getElementById('custom-marker');
const infoMarker = document.querySelector('#info-marker');

// move marker to cursor position
function moveMarker(event) {
  const svg = event.target.closest('svg');
  const svgRect = svg.getBoundingClientRect();
  const xPercent = (event.clientX - svgRect.left) / svgRect.width * 100;
  const yPercent = (event.clientY - svgRect.top) / svgRect.height * 100;

  const cx = xPercent / 100 * 2988;
  const cy = yPercent / 100 * 2273;

  marker.setAttribute('cx', cx);
  marker.setAttribute('cy', cy);

  const cxValue = (31 * Number(cx) - 22190) / 1407;
  const cyValue = -0.01246 * Number(cy) + 26.73;
  calculate(cxValue, cyValue, '.results');
}

graphOutline.addEventListener('mouseover', () => {
  graphOutline.addEventListener('mousemove', (event) => {
    moveMarker(event);
  });
});

let number = 1;

graphOutline.addEventListener('click', () => {
  const cx = marker.getAttribute('cx');
  const cy = marker.getAttribute('cy');

  const placedMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  placedMarker.setAttribute('cx', cx);
  placedMarker.setAttribute('cy', cy);
  placedMarker.setAttribute('class', `placed-marker number-${number}`);
  fixedMarkerGroup.appendChild(placedMarker);

  const item = document.createElement('span');
  item.classList.add(`marker-item`);
  item.classList.add(`number-${number}`);
  item.innerHTML = `Marker ${number}`;
  infoMarker.appendChild(item);
  number++;
  showMarkerInfo();
});

graphOutline.addEventListener('mouseout', () => {
  graphOutline.removeEventListener('mousemove', moveMarker);
});

// stop moveMarker when cursor hovered to custom-marker
fixedMarkerGroup.addEventListener('mouseover', () => {
  graphOutline.removeEventListener('mousemove', moveMarker);
});

function showMarkerInfo() {
  const markerItems = document.querySelectorAll('.marker-item');
  const markers = document.querySelectorAll('.placed-marker');
  const borderMarker = document.querySelector('.border-marker');

  function toggleShow(item, isMarker) {
    const classList = Array.from(item.classList);
    const numberClass = classList.find(cls => cls.startsWith('number-'));
    const markerNumber = numberClass ? numberClass.split('-')[1] : null;

    // Check if the item/marker is already shown
    const isItemShown = item.classList.contains('show');

    // Remove 'show' from all item/marker
    markerItems.forEach(i => i.classList.remove('show'));
    markers.forEach(m => m.classList.remove('show'));

    // If already shown, simply remove 'show'
    if (isItemShown) {
      document.querySelector('.marker-detail').innerHTML = ``;
      const selectedMarker = document.querySelector(`.placed-marker.number-${markerNumber}`);
      selectedMarker.classList.remove('show');
      borderMarker.setAttribute("cx", 0);
      borderMarker.setAttribute("cy", 0);
    } else {
      // Show the selected item/marker
      item.classList.add('show');
      if (isMarker) {
        const selectedItem = document.querySelector(`.marker-item.number-${markerNumber}`);
        selectedItem.classList.add('show');
      } else {
        const selectedMarker = document.querySelector(`.placed-marker.number-${markerNumber}`);
        selectedMarker.classList.add('show');
      }

      // Move border-marker to selected marker position
      const targetMarker = isMarker ? item : document.querySelector(`.placed-marker.number-${markerNumber}`);
      const cx = targetMarker.getAttribute("cx");
      const cy = targetMarker.getAttribute("cy");
      borderMarker.setAttribute("cx", cx);
      borderMarker.setAttribute("cy", cy);

      const cxValue = (31 * Number(cx) - 22190) / 1407;
      const cyValue = -0.01246 * Number(cy) + 26.73;
      calculate(cxValue, cyValue, `.marker-detail`);
    }
  }

  markerItems.forEach(item => {
    item.onclick = () => toggleShow(item, false);
  });

  markers.forEach(marker => {
    marker.onclick = () => toggleShow(marker, true);
  });
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

// Data Struktur untuk Definisi Kombinasi yang Diizinkan (Symmetrical)
// Kunci (key) adalah kode parameter, Nilai (value) adalah daftar kode parameter yang diizinkan berpasangan dengannya.
// Semua kombinasi dijamin bolak-balik (simetris).
const connectionList = {
  'Tdb': ['W', 'pw', 'phi', 'Tdew', 'Twb', 'h', 'v', 'rho', 'mu'],
  'W': ['Tdb', 'phi', 'Twb', 'h', 'v', 'rho', 'mu'],
  'pw': ['Tdb', 'phi', 'Twb', 'h', 'v', 'rho', 'mu'],
  'phi': ['Tdb', 'W', 'pw', 'Twb', 'h', 'v', 'rho', 'mu'],
  'Tdew': ['Tdb', 'Twb', 'h', 'v', 'rho', 'mu'],
  'Twb': ['Tdb', 'W', 'pw', 'phi', 'Tdew', 'h', 'v', 'rho', 'mu'],
  'h': ['Tdb', 'W', 'pw', 'phi', 'Tdew', 'Twb', 'v', 'rho', 'mu'],
  'v': ['Tdb', 'W', 'pw', 'phi', 'Tdew', 'Twb', 'h', 'mu'],
  'rho': ['Tdb', 'W', 'pw', 'phi', 'Tdew', 'Twb', 'h', 'mu'],
  'mu': ['Tdb', 'W', 'pw', 'phi', 'Tdew', 'Twb', 'h', 'v', 'rho']
};

// Pemetaan untuk nama yang lebih mudah dibaca dan simbol (Unicode/HTML Entity)
const displayNames = {
  'Tdb': 'Tdb (Suhu Bola Kering)',
  'W': 'W (Kelembaban Mutlak)',
  'pw': 'pw (Tekanan Uap Air)',
  'phi': '\u03C6 (Kelembaban Relatif)', // Unicode phi
  'Tdew': 'Tdew (Suhu Titik Embun)',
  'Twb': 'Twb (Suhu Bola Basah)',
  'h': 'h (Entalpi)',
  'v': 'v (Volume Spesifik)',
  'rho': '\u03C1 (Massa Jenis)', // Unicode rho
  'mu': '\u03BC (Viskositas)' // Unicode mu
};

const select1 = document.getElementById('select1');
const select2 = document.getElementById('select2');

// Fungsi untuk mengisi opsi di Select 1
function populateSelect1() {
  // Ambil semua kunci (Tdb, W, pw, dll.)
  const keys = Object.keys(connectionList);

  keys.forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = displayNames[key];
    select1.appendChild(option);
  });
}

// Fungsi utama untuk memfilter dan mengisi opsi di Select 2
function filterAndPopulateSelect2(selectedKey) {
  // 1. Reset Select 2
  select2.innerHTML = '<option value="" disabled selected>Select second parameter</option>';
  select2.disabled = true;
  select2.selectedIndex = 0; // Pastikan kembali ke opsi default

  // Jika Select 1 belum dipilih, keluar dari fungsi
  if (!selectedKey) return;

  // 2. Dapatkan daftar pasangan yang diizinkan
  const allowedPartners = connectionList[selectedKey] || [];

  // 3. Aktifkan Select 2
  select2.disabled = false;


  // 4. Isi Select 2 dengan opsi yang diizinkan
  allowedPartners.forEach(partnerKey => {
    // Pastikan opsi yang dipilih di Select 1 tidak muncul di Select 2
    if (partnerKey !== selectedKey) {
      const option = document.createElement('option');
      option.value = partnerKey;
      option.textContent = displayNames[partnerKey];
      select2.appendChild(option);
    }
  });
}

// --- Event Listeners ---

// Ketika Select 1 berubah, filter Select 2
select1.addEventListener('change', () => {
  const selectedKey = select1.value;
  filterAndPopulateSelect2(selectedKey);
});

// --- Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
  populateSelect1();
  // Panggil filterAndPopulateSelect2 secara eksplisit untuk memastikan Select 2 dinonaktifkan di awal
  filterAndPopulateSelect2(select1.value);
});