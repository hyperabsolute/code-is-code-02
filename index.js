var c = document.getElementById('canv'),
    $ = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

function möb(a, b, c) {
  var pa = a[0] * a[0] + a[1] * a[1],
      pb = b[0] * b[0] + b[1] * b[1],
      pc = c[0] * c[0] + c[1] * c[1];
  var y = (
    (a[0] - b[0]) * (pb - pc) - (b[0] - c[0]) * (pa - pb)
  ) / (
    2 * (b[1] - a[1]) * (b[0] - c[0]) - 2 * (a[0] - b[0]) * (c[1] - b[1])
  ),
      x = (pa - pb + 2 * (b[1] - a[1]) * y) / (2 * (a[0] - b[0])),
      r = Math.sqrt((x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]));
  return [x, y, r];
}

function arcs(x, y, r) {
  var c = möb_arc(x, y, r);
  if (c[2] > 10) return;
  $.beginPath();
  $.arc(c[0], c[1], c[2], 0, Math.PI*2, false);
  $.fill();

}
function möb_pt(x, y) {
  var denom = (x + 1) * (x + 1) + y * y;
  return [(x * x - 1 + y * y) / denom, 2 * y / denom];
}
function möb_arc(x, y, r) {
  var a = möb_pt(x - r, y),
      b = möb_pt(x + r, y),
      c = möb_pt(x, y + r);
  return möb(a, b, c);
}

function cmul(w, z) {
  return [
    w[0] * z[0] - w[1] * z[1],
    w[0] * z[1] + w[1] * z[0]
  ];
}

function rotate(z, theta) {
  return cmul(z, [Math.cos(theta), Math.sin(theta)]);
}

function modulus(p) {
  return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}

function crecip(z) {
  var d = z[0] * z[0] + z[1] * z[1];
  return [z[0] / d, -z[1] / d];
}

function spiral(r, st, delta, opts) {
  var rd = crecip(delta),
      md = modulus(delta),
      mrd = 1 / md,
      colidx = opts.i,
      cols = opts.fill,
      min_d = opts.min_d,
      max_d = opts.max_d;
  for (var q = st, mod_q = modulus(q); mod_q < max_d; q = cmul(q, delta), mod_q *= md) {
    $.fillStyle = cols[colidx];
    arcs(q[0], q[1], mod_q * r);
    colidx = (colidx + 1) % cols.length;
  }
  colidx = ((opts ? opts.i : 0) + cols.length - 1) % cols.length;
  for (var q = cmul(st, rd), mod_q = modulus(q); mod_q > min_d; q = cmul(q, rd), mod_q *= mrd) {
    $.fillStyle = cols[colidx];
    arcs(q[0], q[1], mod_q * r);
    colidx = (colidx + cols.length - 1) % cols.length;
  }
}

var p = 15,
    q = 27;
var root = doyle(p, q);
var rep = 15000;

function anim(t) {
  $.setTransform(1, 0, 0, 1, 0, 0);
  $.clearRect(0, 0, c.width, c.height);
  $.translate(Math.round(c.width / 2), Math.round(c.height / 2));
  $.scale(200, 200);

  var beg = rotate(root.a, Math.PI * 2 * t);
  for (var i = 0; i < q; i++) {
    spiral(root.r, beg, root.a, {
      fill: ["#fff", "#ff3300", "#954682"],
      i: (i) % 3,
      min_d: 1e-3,
      max_d: 1e3
    });
    beg = cmul(beg, root.b);
  }
}

var fst;
function run(ts) {
  if (!fst) fst = ts;
  anim(((ts - fst) % rep) / rep);
  window.requestAnimationFrame(run);
}
run();