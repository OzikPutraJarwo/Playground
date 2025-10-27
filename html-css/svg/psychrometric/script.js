let pres = 101.325; // kPa
let T, W, pw, pws, phi, Ws, mu, Tdew, Twb, h, v;

const inputs = document.querySelectorAll('#x-input, #y-input');
inputs.forEach(input => input.addEventListener('input', () => {
  // Marker X axis
  const xValue = 45.38709677419355 * Number(document.getElementById('x-input').value) + 715.8064516129032;
  document.querySelector('.marker').setAttribute('cx', xValue);
  // Marker Y axis
  const yValue = -80.15384615384616 * Number(document.getElementById('y-input').value) + 2144;
  document.querySelector('.marker').setAttribute('cy', yValue);
  // Calculate parameters
  calculate(Number(document.getElementById('x-input').value), Number(document.getElementById('y-input').value));
}));

function calculate(xValue, yValue) {

  // Dry Bulb Temperature (T)
  T = xValue; // °C

  // Humidity Ratio (W)
  W = yValue / 1000; // kg/kg

  // Vapor Pressure (pw)
  pw = (W * pres) / (0.622 + W); // kPa

  // Saturation Vapor Pressure (pws[T])
  pws = 0.61094 * Math.exp((17.625 * T) / (T + 243.04)); // kPa

  // Relative Humidity (ϕ)
  phi = pw / pws; // %

  // Saturation Humidity Ratio
  Ws = 0.622 * pws / (pres - pws); // (kg/kgda)

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
  Twb = findTwb_bisection(T, W, pres); // °C

  // Specific Enthalpy (h)
  h = 1.006 * T + W * (2501 + 1.86 * T); // kg dry air

  // Specific Volume (v)
  v = 0.287042 * (T + 273.15) * (1 + 1.6078 * W) / pres; // m³/kgda

  // Moist Air Density (ρ)
  p = (1 + W) / v; // kg/m³

  // Display results
  document.getElementById('results').innerHTML = `
    <p>Dry Bulb Temperature (T): ${T.toFixed(2)} °C</p>
    <p>Humidity Ratio (W): ${W.toFixed(6)} kg/kg</p>
    <p>Vapor Pressure (pw): ${pw.toFixed(4)} kPa</p>
    <p>Saturation Vapor Pressure (pws): ${pws.toFixed(4)} kPa</p>
    <p>Relative Humidity (ϕ): ${(phi * 100).toFixed(2)} %</p>
    <p>Saturation Humidity Ratio (Ws): ${Ws.toFixed(6)} kg/kgda</p>
    <p>Degree of Saturation (μ): ${(mu * 100).toFixed(2)} %</p>
    <p>Dew Point Temperature (Tdew): ${Tdew.toFixed(2)} °C</p>
    <p>Wet Bulb Temperature (Twb): ${Twb.toFixed(2)} °C</p>
    <p>Specific Enthalpy (h): ${h.toFixed(2)} kJ/kg dry air</p>
    <p>Specific Volume (v): ${v.toFixed(4)} m³/kg dry air</p>
    <p>Moist Air Density (ρ): ${p.toFixed(4)} kg/m³</p>
  `;

}

const graphOutline = document.querySelector('.graph-outline');
const marker = document.querySelector('.moving-marker');
const fixedMarkerGroup = document.getElementById('fixed-marker');

graphOutline.addEventListener('mouseover', () => {
  graphOutline.addEventListener('mousemove', () => {
    moveMarker(event);
    const cx = marker.getAttribute('cx');
    const cy = marker.getAttribute('cy');
    const cxValue = (31 * Number(cx) - 22190) / 1407;
    const cyValue = -0.01246 * Number(cy) + 26.73;
    calculate(cxValue, cyValue);
  });
  graphOutline.addEventListener('click', () => {
    const cx = marker.getAttribute('cx');
    const cy = marker.getAttribute('cy');
    const placedMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    placedMarker.setAttribute('cx', cx);
    placedMarker.setAttribute('cy', cy);
    placedMarker.setAttribute('r', 7);
    placedMarker.setAttribute('fill', 'red');
    placedMarker.setAttribute('class', 'placed-marker');
    fixedMarkerGroup.appendChild(placedMarker);
  })
});

graphOutline.addEventListener('mouseout', () => {
  graphOutline.removeEventListener('mousemove', moveMarker);
});

function moveMarker(event) {
  const svg = event.target.closest('svg');
  const svgRect = svg.getBoundingClientRect();
  const xPercent = (event.clientX - svgRect.left) / svgRect.width * 100;
  const yPercent = (event.clientY - svgRect.top) / svgRect.height * 100;

  const cx = xPercent / 100 * 2988;
  const cy = yPercent / 100 * 2273;

  marker.setAttribute('cx', cx);
  marker.setAttribute('cy', cy);
}