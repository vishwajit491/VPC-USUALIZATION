(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STEPS = [
    { t: 'The land: VPC', s: 'Ravi buys a walled plot',
      plain: "Ravi, a shop owner, buys a big plot of land and builds a wall around it. Only he decides who lives inside, who may enter and which doors exist. The plot sits in one big city (the AWS Cloud).",
      tech: 'VPC (Virtual Private Cloud) with CIDR 10.0.0.0/16, inside an AWS Region.',
      watch: 'The dashed blue outline is the city (AWS Cloud). The teal box is Ravi\'s walled society (the VPC).' },
    { t: 'Two buildings: Availability Zones', s: 'Separate towers, separate risks',
      plain: "Ravi builds two separate buildings far enough apart that a power cut or fire in one does not hurt the other. If one building is closed, the other keeps working.",
      tech: 'Availability Zones (AZ A and AZ B): isolated data-centre groups in one Region.',
      watch: 'Two blue buildings appear side by side inside the teal walls.' },
    { t: 'Lobby and flats: Subnets', s: 'Public lobby, private flats',
      plain: "Each building has a lobby that guests may enter (gold) and private flats for residents only (purple). Guests meet staff in the lobby; the valuable things stay in the flats.",
      tech: 'Public subnets (route to the internet) and private subnets (no direct route from the internet).',
      watch: 'Gold boxes are public lobbies, purple boxes are private flats, one pair in each building.' },
    { t: 'The main gate: Internet Gateway', s: 'Visitors can finally arrive',
      plain: "Ravi opens one main gate on the wall. A signboard at the gate gives directions: 'anything for the outside world goes through this gate.' Now visitors from the street can come in.",
      tech: 'Internet Gateway (IGW) attached to the VPC, plus a route table with 0.0.0.0/0 pointing to the IGW.',
      watch: 'A visitor\'s request (envelope) travels from the Internet to the gate.' },
    { t: 'Receptionist and counters: Load Balancer', s: 'Visitors are shared fairly',
      plain: "A receptionist at the gate sends each visitor to a free shop counter, alternating between the two buildings. If one counter closes, everyone is sent to the other. These counters are the first tier, the part customers see.",
      tech: 'Application Load Balancer across both AZs, forwarding to web servers (tier 1: web tier).',
      watch: 'Envelopes go from the gate to the receptionist bar, then split to the web server in each building.' },
    { t: 'Back office and record room', s: 'App servers and the database',
      plain: "The shop counter passes the order to a back-office manager (tier 2) who checks the rules, and the manager writes it in the record room (tier 3). Building B keeps a live copy of the records, so nothing is lost if building A fails.",
      tech: 'App tier (app servers) and data tier (database, primary in AZ A, standby replica in AZ B with synchronous replication).',
      watch: 'Floppy disks (data) move web, app, database. The arrows between the databases are the copying.' },
    { t: 'One-way hatch: NAT Gateway', s: 'Flats can send out, not receive in',
      plain: "Staff in the flats sometimes need to order supplies from outside, such as software updates. A one-way hatch in the lobby lets them send out and receive the parcel back, but strangers cannot use it to get in.",
      tech: 'NAT Gateway in a public subnet gives private subnets outbound-only internet access.',
      watch: 'A package leaves the app server, goes through the hatch, then through the main gate to the Internet.' },
    { t: 'Guards everywhere: Security', s: 'Guards at doors and wings',
      plain: "Every worker has a personal bodyguard at the door who checks who may talk to them. Each wing also has a guard at its entrance. An intruder who sneaks in from the street is stopped before reaching the private flats.",
      tech: 'Security Groups (per-server firewalls) and Network ACLs (per-subnet firewalls).',
      watch: 'The devil heads for the private flats and meets a red cross: Blocked!' },
    { t: 'Secret tunnel and neighbour bridge', s: 'Ravi\'s office and a partner',
      plain: "Ravi's own office has a secret underground tunnel straight to the private flats, so he can work safely without using the street. A friendly neighbouring society is joined by a private bridge, so the two can visit without going through the public gate.",
      tech: 'Site-to-Site VPN via a Virtual Private Gateway, and VPC Peering with a partner VPC.',
      watch: 'The lock travels through the green tunnel; the handshake crosses the bridge to the Partner VPC.' }
  ];
  var LEGEND = [['\u2709\uFE0F', 'Visitor request'], ['\uD83D\uDCBE', 'Data'], ['\uD83D\uDD01', 'Database copying'],
    ['\uD83D\uDCE6', 'Software update'], ['\uD83D\uDE08', 'Intruder'], ['\uD83D\uDD12', 'Office VPN'], ['\uD83E\uDD1D', 'Partner peering']];

  var W = [], B = [], K = [];
  var g = function (s, h) { return '<g class="piece" data-s="' + s + '">' + h + '</g>'; };
  var txt = function (x, y, t, c, a) { return '<text x="' + x + '" y="' + y + '" class="' + (c || 'lbl') + '" text-anchor="' + (a || 'middle') + '">' + t + '</text>'; };
  function area(s, x, y, w, h, c, label, lx, ly, a) {
    B.push(g(s, '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14" class="' + c + '"/>' + (label ? txt(lx, ly, label, 'area-l', a) : '')));
  }
  function box(s, x, y, w, h, c, lines, small) {
    var o = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (small ? 6 : 10) + '" class="' + c + '"/>';
    var st = small ? 11 : 15, y0 = y + h / 2 - (lines.length - 1) * st / 2 + 4;
    lines.forEach(function (t, i) { o += txt(x + w / 2, y0 + i * st, t, (i ? 'sub' : 'lbl') + (small ? ' sm' : '')); });
    B.push(g(s, o));
  }
  function tag(s, x, y, w, t) { box(s, x, y, w, 15, 'sec', [t], true); }
  function wire(s, id, d, c) { W.push(g(s, '<path id="' + id + '" d="' + d + '" class="wire ' + (c || '') + '"/>')); }
  function pk(s, e, id, dur, begin, cycle) {
    var f = (dur / cycle).toFixed(3), f2 = (dur / cycle + 0.001).toFixed(3);
    K.push(g(s, '<text class="pk" opacity="0" text-anchor="middle" dominant-baseline="central">' + e +
      '<animateMotion dur="' + cycle + 's" begin="' + begin + 's" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;' + f + ';1"><mpath href="#' + id + '"/></animateMotion>' +
      '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + f + ';' + f2 + ';1" dur="' + cycle + 's" begin="' + begin + 's" repeatCount="indefinite"/></text>'));
  }

  /* ---- Step 1 ---- */
  area(1, 135, 10, 955, 600, 'region', 'AWS Cloud (Region)', 150, 29, 'start');
  area(1, 160, 40, 780, 535, 'vpc', "VPC 10.0.0.0/16 : Ravi's society", 175, 59, 'start');
  /* ---- Step 2 ---- */
  area(2, 235, 72, 330, 493, 'az', 'Availability Zone A', 400, 89);
  area(2, 585, 72, 330, 493, 'az', 'Availability Zone B', 750, 89);
  /* ---- Step 3 ---- */
  [250, 600].forEach(function (x) {
    area(3, x, 98, 300, 177, 'pub', 'Public subnet', x + 12, 114, 'start');
    area(3, x, 305, 300, 250, 'prv', 'Private subnet', x + 12, 322, 'start');
  });
  /* ---- Step 4 ---- */
  box(4, 10, 85, 100, 45, 'ext', ['Visitors', 'people outside']);
  box(4, 10, 185, 100, 60, 'ext', ['The Internet', 'the street']);
  box(4, 147, 195, 46, 45, 'gw', ['Internet', 'Gateway'], true);
  box(4, 10, 262, 115, 36, 'ext', ['Route table', '0.0.0.0/0 \u2192 IGW'], true);
  wire(4, 'vi', 'M60 130 V185', 'gold');
  wire(4, 'in', 'M112 217 H149', 'gold');
  pk(4, '\u2709\uFE0F', 'in', 1.2, 0, 4);
  /* ---- Step 5 ---- */
  B.push(g(5, '<rect x="240" y="124" width="670" height="26" rx="8" class="lb"/>' + txt(575, 141, 'Load balancer: the receptionist')));
  box(5, 330, 190, 100, 40, 'srv', ['Web server', 'counter A']);
  box(5, 650, 190, 100, 40, 'srv', ['Web server', 'counter B']);
  wire(5, 'p5', 'M193 217 H213 V134 H236', 'gold');
  wire(5, 'lbA', 'M380 150 V190', 'gold');
  wire(5, 'lbB', 'M700 150 V190', 'gold');
  pk(5, '\u2709\uFE0F', 'p5', 1.2, 1.2, 4); pk(5, '\u2709\uFE0F', 'lbA', 1, 2.4, 4); pk(5, '\u2709\uFE0F', 'lbB', 1, 3, 4);
  /* ---- Step 6 ---- */
  box(6, 330, 345, 100, 40, 'srv', ['App server', 'manager A']);
  box(6, 650, 345, 100, 40, 'srv', ['App server', 'manager B']);
  box(6, 330, 445, 100, 44, 'db', ['Database', 'record room']);
  box(6, 650, 445, 100, 44, 'db', ['Live copy DB', 'duplicate']);
  wire(6, 'wa', 'M425 230 V345', 'purple'); wire(6, 'ad', 'M425 385 V445', 'purple');
  wire(6, 'wb', 'M745 230 V345', 'purple'); wire(6, 'ab', 'M745 385 V445', 'purple');
  wire(6, 'r1', 'M430 467 H650', 'purple'); wire(6, 'r2', 'M650 475 H430', 'hid');
  pk(6, '\uD83D\uDCBE', 'wa', 1.4, 0, 5); pk(6, '\uD83D\uDCBE', 'ad', 1, 1.5, 5);
  pk(6, '\uD83D\uDCBE', 'wb', 1.4, 0.6, 5); pk(6, '\uD83D\uDCBE', 'ab', 1, 2.1, 5);
  pk(6, '\uD83D\uDD01', 'r1', 1.6, 3.3, 5); pk(6, '\uD83D\uDD01', 'r2', 1.6, 4, 5);
  /* ---- Step 7 ---- */
  box(7, 440, 190, 100, 40, 'gw', ['NAT Gateway', 'one-way hatch']);
  wire(7, 'u1', 'M430 365 H490 V232', 'gold'); wire(7, 'u2', 'M490 190 V168 H170 V196', 'gold'); wire(7, 'u3', 'M147 232 H112', 'gold');
  pk(7, '\uD83D\uDCE6', 'u1', 1.6, 0, 5); pk(7, '\uD83D\uDCE6', 'u2', 1.7, 1.7, 5); pk(7, '\uD83D\uDCE6', 'u3', 0.8, 3.4, 5);
  /* ---- Step 8 ---- */
  [[349, 233], [669, 233], [349, 388], [669, 388], [349, 492], [669, 492]].forEach(function (p) { tag(8, p[0], p[1], 62, 'SG guard'); });
  tag(8, 258, 256, 70, 'NACL guard'); tag(8, 608, 256, 70, 'NACL guard');
  tag(8, 258, 537, 70, 'NACL guard'); tag(8, 608, 537, 70, 'NACL guard');
  wire(8, 'int', 'M110 240 H128 V420 H232', 'red');
  pk(8, '\uD83D\uDE08', 'int', 2.6, 0, 5);
  K.push(g(8, '<g opacity="0"><line x1="240" y1="410" x2="258" y2="430" stroke="#f87171" stroke-width="5" stroke-linecap="round"/><line x1="258" y1="410" x2="240" y2="430" stroke="#f87171" stroke-width="5" stroke-linecap="round"/>' +
    txt(168, 452, 'Blocked!', 'lbl', 'start').replace('class="lbl"', 'class="lbl" style="fill:#f87171"') +
    '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.5;0.52;0.92;1" dur="5s" repeatCount="indefinite"/></g>'));
  /* ---- Step 9 ---- */
  box(9, 10, 465, 105, 70, 'off', ["Ravi's office", '(own network)']);
  box(9, 148, 482, 52, 36, 'off', ['VPN', 'gateway'], true);
  box(9, 960, 350, 120, 100, 'peer', ['Partner VPC', '172.16.0.0/16']);
  B.push(g(9, txt(1020, 470, 'VPC peering', 'sub')));
  wire(9, 'o1', 'M115 500 H148', 'green'); wire(9, 'o2', 'M200 500 H248', 'green');
  wire(9, 'pe', 'M900 400 H958', 'green'); wire(9, 'pe2', 'M958 410 H900', 'hid');
  pk(9, '\uD83D\uDD12', 'o1', 0.8, 0, 4); pk(9, '\uD83D\uDD12', 'o2', 1, 0.9, 4);
  pk(9, '\uD83E\uDD1D', 'pe', 1.4, 0, 4); pk(9, '\uD83E\uDD1D', 'pe2', 1.4, 2, 4);

  var svg = document.getElementById('stage');
  svg.innerHTML = '<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" class="dots"/></pattern></defs>' +
    '<rect width="1100" height="620" fill="url(#dots)"/>' + W.join('') + B.join('') + K.join('');

  /* ---- UI ---- */
  var cur = 0, timer = null;
  var nav = document.getElementById('steps'), playBtn = document.getElementById('play');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  STEPS.forEach(function (st, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'step';
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span><b>' + st.t + '</b><small>' + st.s + '</small></span>';
    b.addEventListener('click', function () { stop(); show(i + 1); });
    nav.appendChild(b);
  });
  document.getElementById('legend').innerHTML = LEGEND.map(function (l) { return '<li><span>' + l[0] + '</span>' + l[1] + '</li>'; }).join('');

  function show(n) {
    var prev = cur; cur = n;
    svg.querySelectorAll('.piece').forEach(function (el) {
      var s = +el.getAttribute('data-s');
      el.classList.toggle('show', s <= n);
      el.classList.remove('new');
      if (s === n && n > prev) { void el.getBoundingClientRect(); el.classList.add('new'); }
    });
    Array.prototype.forEach.call(nav.children, function (b, i) {
      b.classList.toggle('cur', i + 1 === n);
      b.classList.toggle('done', i + 1 < n);
      if (i + 1 === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    var st = STEPS[n - 1];
    document.getElementById('cTitle').textContent = st ? 'Step ' + n + ': ' + st.t : 'Press a step to begin';
    document.getElementById('cPlain').textContent = st ? st.plain : 'Pick step 1 on the left, or press Auto-play, and the society will be built piece by piece.';
    document.getElementById('cTech').textContent = st ? st.tech : 'AWS 3-tier architecture inside a VPC.';
    document.getElementById('cWatch').textContent = st ? st.watch : 'The dark stage is empty until you start.';
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = 'Auto-play'; }
  function play() {
    if (timer) { stop(); return; }
    playBtn.textContent = 'Pause';
    if (cur >= STEPS.length) show(1); else if (cur === 0) show(1);
    timer = setInterval(function () { if (cur >= STEPS.length) { stop(); return; } show(cur + 1); }, 5000);
  }
  playBtn.addEventListener('click', play);
  document.getElementById('reset').addEventListener('click', function () { stop(); show(0); });
  if (reduce && svg.pauseAnimations) { svg.setCurrentTime(1); svg.pauseAnimations(); }
  show(0);
})();
