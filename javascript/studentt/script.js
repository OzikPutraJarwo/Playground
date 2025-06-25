// Fungsi-fungsi pendukung dari jStat
function betacf(x, a, b) {
  var fpmin = 1e-30;
  var m, m2, aa, c, d, del, h, qab, qam, qap;
  qab = a + b;
  qap = a + 1;
  qam = a - 1;
  c = 1;
  d = 1 - qab * x / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  h = d;
  for (m = 1; m <= 100; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < 1e-14) break;
  }
  return h;
}

function ibetainv(p, a, b) {
  var EPS = 1e-8;
  var a1 = a - 1;
  var b1 = b - 1;
  var j = 0;
  var lna, lnb, pp, t, u, err, x, al, h, w, afac;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (a >= 1 && b >= 1) {
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
    if (p < 0.5) x = -x;
    al = (x * x - 3) / 6;
    h = 2 / (1 / (2 * a - 1) + 1 / (2 * b - 1));
    w = (x * Math.sqrt(al + h)) / h - (1 / (2 * b - 1) - 1 / (2 * a - 1)) * (al + 5 / 6 - 2 / (3 * h));
    x = a / (a + b * Math.exp(2 * w));
  } else {
    lna = Math.log(a / (a + b));
    lnb = Math.log(b / (a + b));
    t = Math.exp(a * lna) / a;
    u = Math.exp(b * lnb) / b;
    w = t + u;
    if (p < t / w) x = Math.pow(a * w * p, 1 / a);
    else x = 1 - Math.pow(b * w * (1 - p), 1 / b);
  }
  afac = -Math.log(jStat.betafn(a, b));
  for (; j < 10; j++) {
    if (x === 0 || x === 1) return x;
    err = jStat.ibeta(x, a, b) - p;
    t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
    u = err / t;
    x -= u;
    if (x <= 0) x = 0.5 * (x + u);
    if (x >= 1) x = 0.5 * (x + u + 1);
    if (Math.abs(u) < EPS * x && j > 0) break;
  }
  return x;
}

function studenttInv(p, dof) {
  var x = ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
  x = Math.sqrt(dof * (1 - x) / x);
  return (p > 0.5) ? x : -x;
}

// Tambahkan fungsi jStat.ibeta dan jStat.betafn sesuai kebutuhan jika diperlukan lebih lanjut


//////////////////////////////////////////////////////

(function () {
  if (!console) {
    console = {};
  }
  var old = console.log;
  var logger = document.getElementById('log');
  console.log = function (message) {
    if (typeof message == 'object') {
      logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />';
    } else {
      logger.innerHTML += message + '<br />';
    }
  }
})();

console.log(jStat.studentt.inv(0.95, 12));
console.log(studenttInv(0.95, 12));