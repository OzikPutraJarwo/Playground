function gammaln(x) {
  var j = 0;
  var cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  var ser = 1.000000000190015;
  var xx, y, tmp;
  tmp = (y = xx = x) + 5.5;
  tmp -= (xx + 0.5) * Math.log(tmp);
  for (; j < 6; j++)
    ser += cof[j] / ++y;
  return Math.log(2.5066282746310005 * ser / xx) - tmp;
};
function gammafn(x) {
  var p = [-1.716185138865495, 24.76565080557592, -379.80425647094563,
    629.3311553128184, 866.9662027904133, -31451.272968848367,
  -36144.413418691176, 66456.14382024054
  ];
  var q = [-30.8402300119739, 315.35062697960416, -1015.1563674902192,
  -3107.771671572311, 22538.118420980151, 4755.8462775278811,
  -134659.9598649693, -115132.2596755535];
  var fact = false;
  var n = 0;
  var xden = 0;
  var xnum = 0;
  var y = x;
  var i, z, yi, res;
  if (x > 171.6243769536076) {
    return Infinity;
  }
  if (y <= 0) {
    res = y % 1 + 3.6e-16;
    if (res) {
      fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * res);
      y = 1 - y;
    } else {
      return Infinity;
    }
  }
  yi = y;
  if (y < 1) {
    z = y++;
  } else {
    z = (y -= n = (y | 0) - 1) - 1;
  }
  for (i = 0; i < 8; ++i) {
    xnum = (xnum + p[i]) * z;
    xden = xden * z + q[i];
  }
  res = xnum / xden + 1;
  if (yi < y) {
    res /= yi;
  } else if (yi > y) {
    for (i = 0; i < n; ++i) {
      res *= y;
      y++;
    }
  }
  if (fact) {
    res = fact / res;
  }
  return res;
};
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
function betafn(x, y) {
  if (x <= 0 || y <= 0)
    return undefined;
  return (x + y > 170)
    ? Math.exp(betaln(x, y))
    : gammafn(x) * gammafn(y) / gammafn(x + y);
};
function betaln(x, y) {
  return gammaln(x) + gammaln(y) - gammaln(x + y);
};
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
  afac = -Math.log(betafn(a, b));
  for (; j < 10; j++) {
    if (x === 0 || x === 1) return x;
    err = ibeta(x, a, b) - p;
    t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
    u = err / t;
    x -= u;
    if (x <= 0) x = 0.5 * (x + u);
    if (x >= 1) x = 0.5 * (x + u + 1);
    if (Math.abs(u) < EPS * x && j > 0) break;
  }
  return x;
};
function ibeta(x, a, b) {
  var bt = (x === 0 || x === 1) ? 0 :
    Math.exp(gammaln(a + b) - gammaln(a) -
      gammaln(b) + a * Math.log(x) + b *
      Math.log(1 - x));
  if (x < 0 || x > 1)
    return false;
  if (x < (a + 1) / (a + b + 2))
    return bt * betacf(x, a, b) / a;
  return 1 - bt * betacf(1 - x, b, a) / b;
};
function studenttInv(p, dof) {
  var x = ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
  x = Math.sqrt(dof * (1 - x) / x);
  return (p > 0.5) ? x : -x;
}


(function () {
  if (!console) {
    console = {};
  }
  var logger = document.getElementById('log');
  console.log = function (message) {
    if (typeof message == 'object') {
      logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />';
    } else {
      logger.innerHTML += message + '<br />';
    }
  }
})();

console.log(studenttInv(0.1, 50));
console.log(jStat.studentt.inv(0.1, 50));