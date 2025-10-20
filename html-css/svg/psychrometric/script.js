let p = 101.325; // kPa
let T, W, pw, pws, phi, Ws, mu, Tdew, Twb, h, v;

const inputs = document.querySelectorAll('#x-input, #y-input');
inputs.forEach(input => input.addEventListener('input', () => {
  document.querySelector('.marker').setAttribute('cx', Number(document.getElementById('x-input').value) + 35);
  document.querySelector('.marker').setAttribute('cy', Number(document.getElementById('y-input').value) + 60);

  const xValue = 45.38709677419355 * Number(document.getElementById('x-input').value) + 715.8064516129032;
  document.querySelector('.marker').setAttribute('cx', xValue);

  const yValue = -80.15384615384616 * Number(document.getElementById('y-input').value) + 2144;
  document.querySelector('.marker').setAttribute('cy', yValue);

  calculate(Number(document.getElementById('x-input').value), Number(document.getElementById('y-input').value));
  
}));

function calculate(xValue, yValue) {

  // Dry Bulb Temperature (T)
  T = xValue; // °C

  // Humidity Ratio (W)
  W = yValue / 1000; // kg/kg
  
  // Vapor Pressure (pw)
  pw = (W * p) / (0.622 + W); // kPa

  // Saturation Vapor Pressure (pws[T])
  pws = 0.61094 * Math.exp((17.625 * T) / (T + 243.04)); // kPa

  // Relative Humidity (ϕ)
  phi = pw / pws; // %

  // Saturation Humidity Ratio
  Ws = 0.622 * pws / (p - pws); // (kg/kgda)

  // Degree of Saturation (μ)
  mu = W / Ws; // %

  // Dew Point Temperature (Tdew)
  Tdew = (243.04 * Math.log(pw / 0.61094)) / (17.625 - Math.log(pw / 0.61094)); // °C

  // Wet Bulb Temperature (Twb)
  function calcPws(T) {
    return 0.61094 * Math.exp((17.625 * T) / (T + 243.04));
  }
  function calcWs(T) {
    return 0.622 * calcPws(T) / (p - calcPws(T));
  }
  function findTwb(T, W) {
    let Twb = T;  // initial guess
    for (let i = 0; i < 100; i++) {
      let WsTwb = calcWs(Twb);
      let Wcalc = ((2501 - 2.326 * Twb) * WsTwb - 1.006 * (T - Twb)) /
        (2501 + 1.86 * T - 4.186 * Twb);
      let err = Wcalc - W;
      if (Math.abs(err) < 1e-6) break;
      Twb -= err * 5;  // simple correction step
    }
    return Twb;
  }
  Twb = findTwb(T, W); // °C

  // Specific Enthalpy (h)
  h = 1.006 * T + W * (2501 + 1.86 * T); // kg dry air

  // Specific Volume (v)
  v = 0.287042 * (T + 273.15) * (1 + 1.6078 * W) / p; // m^3/kgda

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
  `;

}