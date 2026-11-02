// Inti Kantor Agent: siapa mengerjakan subagent yang mana. Semua ditentukan dari data transkrip saja
// (deterministik, sama di setiap muat ulang) — port PHP: lib/php/Office.php (harus identik, dicek bin/parity.mjs).
//
// Aturan penugasan (simulasi urut waktu atas semua "job" = segmen kerja subagent 7 hari terakhir):
//   1. Job diurutkan menurut waktu mulai (lalu id run, lalu nomor segmen).
//   2. Anggota tim (Budi, Sari, Agus, Rina) "bebas" bila belum pernah bertugas atau job terakhirnya selesai
//      ≥ cooldown (60 dtk) sebelum job ini mulai. Job diberikan ke anggota bebas PERTAMA menurut urutan tetap.
//   3. Semua sibuk → freelancer: slot freelancer bebas terendah (meja cadangan 1–4; slot ≥ 4 = kartu "+N"),
//      nama dari hash id run (nama yang sedang dipakai freelancer aktif dilewati).
//   4. Segmen lanjutan (subagent dibangunkan lagi, mis. SendMessage) memilih karakter yang sama bila masih bebas.
//   Akhir job: jawaban akhir (end_turn) · TaskStop dari sesi mana pun · limit · tanpa aktivitas > running_window
//   (akhirnya = aktivitas terakhir + running_window, supaya penugasan job lain tidak berubah surut).
import path from 'node:path';
import { Transcripts } from './transcripts.mjs';
import { hash, isoMs, readText, phpTrim, strcmp, tsMs } from './util.mjs';

const VERSION = '1.0.0';

export function buildState({ projectDir, storageDir, cfg, now }) {
  const nowSec = Math.floor(now / 1000);
  const scan = new Transcripts(projectDir, storageDir, cfg).scan(nowSec);
  const RW = cfg.running_window * 1000;
  const CD = cfg.cooldown * 1000;
  const MA = cfg.main_active * 1000;

  // TaskStop dari transkrip mana pun: id agent → daftar waktu (ms)
  const stops = new Map();
  for (const src of [...scan.mains, ...scan.runs]) {
    for (const [id, t] of src.stops) {
      if (!stops.has(id)) stops.set(id, []);
      stops.get(id).push(tsMs(t));
    }
  }

  // run subagent + segmen efektif
  const runs = [...scan.runs].sort((a, b) => cmp(tsMs(a.started), tsMs(b.started)) || strcmp(a.id, b.id));
  const byId = new Map();
  for (const r of runs) {
    const segs = r.segs.map(([a, b]) => ({ start: tsMs(a), startIso: a, end: b === null ? null : tsMs(b), endIso: b }));
    let status = r.limit ? 'limit' : 'selesai';
    let reason = null;
    if (segs.length === 0) {
      const st = tsMs(r.started) || (now - 60000);
      const en = r.updated ? tsMs(r.updated) : null;
      segs.push({ start: st, startIso: r.started || isoMs(st), end: en, endIso: r.updated || null });
    }
    const last = segs[segs.length - 1];
    if (last && last.end === null) {
      const st = (stops.get(r.id) ?? []).filter((ms) => ms >= last.start);
      const upd = tsMs(r.updated);
      if (st.length) {
        last.end = Math.min(...st);
        status = 'terhenti';
        reason = 'dihentikan';
      } else if (r.lastKind === 'handback' || r.limit) {
        last.end = upd;
        status = r.limit ? 'limit' : 'selesai';
      } else if (now - upd <= RW) {
        status = 'bekerja';
      } else {
        last.end = upd + RW;
        status = 'terhenti';
        reason = 'tidak-aktif';
      }
      if (last.end !== null) last.endIso = isoMs(last.end);
    }
    r.effSegs = segs;
    r.status = status;
    r.reason = reason;
    byId.set(r.id, r);
  }

  // ---- simulasi penugasan
  const jobs = [];
  for (const r of runs) r.effSegs.forEach((sg, k) => jobs.push({ run: r, k, ...sg, who: null }));
  jobs.sort((a, b) => cmp(a.start, b.start) || strcmp(a.run.id, b.run.id) || cmp(a.k, b.k));
  const pool = cfg.team.map(() => ({ job: null }));
  const studioSpecialists = [
    { name: 'Yoga', role: 'Database Architect', match: /yoga|database|skema|schema|\bsql\b|cache|redis|migrat/i },
    { name: 'Dewi', role: 'API Integrator', match: /dewi|\bapi\b|integrat|endpoint|rest|postman|swagger|webhook/i },
    { name: 'Rudi', role: 'Mobile Specialist', match: /rudi|mobile|android|compose|kotlin|jetpack/i },
    { name: 'Maya', role: 'Cybersecurity Auditor', match: /maya|cyber|cybersec|owasp|penetration|pentest|security audit/i },
  ];
  const fl = studioSpecialists.map((sp) => ({ job: null, name: sp.name, role: sp.role }));
  const charOf = new Map();
  const free = (slot, start) => slot.job === null || (slot.job.end !== null && slot.job.end + CD <= start);
  for (const job of jobs) {
    const prev = charOf.get(job.run.id) ?? null;
    let pick = null;
    if (job.k > 0 && prev !== null) {
      const slot = prev.kind === 'pool' ? pool[prev.idx] : fl[prev.idx];
      if ((slot.job !== null && slot.job.run === job.run) || free(slot, job.start)) pick = prev;
    }
    if (pick === null) {
      // Pencocokan cerdas berdasarkan nama karakter atau peran spesialis
      const text = `${job.run.description || ''} ${job.run.agentType || ''}`.toLowerCase();

      // 1. Cek spesialis studio baris belakang (Yoga, Dewi, Rudi, Maya)
      for (let s = 0; s < studioSpecialists.length; s++) {
        if (studioSpecialists[s].match.test(text)) {
          if (free(fl[s], job.start)) {
            pick = { kind: 'fl', idx: s, name: studioSpecialists[s].name, role: studioSpecialists[s].role };
            break;
          }
        }
      }

      // 2. Cek nama anggota tim baris depan (Budi, Sari, Agus, Rina)
      if (pick === null) {
        let preferredTeamIdx = -1;
        for (let t = 0; t < cfg.team.length; t++) {
          if (text.includes(cfg.team[t].toLowerCase())) {
            preferredTeamIdx = t;
            break;
          }
        }

        // Cek peran tim inti
        if (preferredTeamIdx < 0) {
          if (/architect|arsitek|vision|analis/i.test(text)) preferredTeamIdx = 0; // Budi
          else if (/wpf|mvvm|developer|frontend|coder/i.test(text)) preferredTeamIdx = 1; // Sari
          else if (/safety|memori|memory/i.test(text)) preferredTeamIdx = 2; // Agus
          else if (/test|qa|tester|pengujian|verify/i.test(text)) preferredTeamIdx = 3; // Rina
        }

        if (preferredTeamIdx >= 0 && preferredTeamIdx < pool.length && free(pool[preferredTeamIdx], job.start)) {
          pick = { kind: 'pool', idx: preferredTeamIdx, name: cfg.team[preferredTeamIdx] };
        }
      }
    }
    if (pick === null) {
      const i = pool.findIndex((s) => free(s, job.start));
      if (i >= 0) pick = { kind: 'pool', idx: i, name: cfg.team[i] };
    }
    if (pick === null) {
      let j = fl.findIndex((s) => free(s, job.start));
      if (j < 0) {
        j = fl.length;
        fl.push({ job: null, name: null, role: 'Spesialis' });
      }
      let name;
      let role = fl[j]?.role || 'Spesialis';
      if (prev !== null && prev.kind === 'fl') {
        name = prev.name;
        role = prev.role || role;
      } else if (j < studioSpecialists.length) {
        name = studioSpecialists[j].name;
        role = studioSpecialists[j].role;
      } else {
        const used = new Set(fl.filter((s) => !free(s, job.start)).map((s) => s.name));
        const L = cfg.freelancers.length;
        const base = hash(job.run.id) % L;
        name = null;
        for (let n = 0; n < L; n++) {
          const cand = cfg.freelancers[(base + n) % L];
          if (!used.has(cand)) {
            name = cand;
            break;
          }
        }
        if (name === null) name = `${cfg.freelancers[base]} ${j + 1}`;
      }
      pick = { kind: 'fl', idx: j, name, role };
    }
    if (pick.kind === 'pool') pool[pick.idx].job = job;
    else {
      fl[pick.idx].job = job;
      fl[pick.idx].name = pick.name;
      if (pick.role) fl[pick.idx].role = pick.role;
    }
    job.who = pick;
    charOf.set(job.run.id, pick);
  }

  const ketuaColor = cfg.colors.ketua;
  const flPal = cfg.colors.freelancers;
  const charInfo = (who, run) => {
    if (who.kind === 'pool') {
      return { key: `tim-${who.idx}`, name: cfg.team[who.idx], label: cfg.team[who.idx], role: ['Lead Architect', 'Core Dev', 'Memory Auditor', 'QA Lead'][who.idx] || 'Tim', color: cfg.colors.team[who.idx % cfg.colors.team.length] };
    }
    if (who.kind === 'studio') {
      const sp = studioSpecialists[who.idx];
      return { key: `studio-${who.idx}`, name: sp.name, label: sp.name, role: sp.role, color: ['#0f8fa3', '#9a7418', '#4f7d3a', '#8a4fa8'][who.idx] };
    }
    return { key: `fl-${who.idx}-${who.name}`, name: who.name, label: who.name, role: who.role || fl[who.idx]?.role || 'Spesialis', color: flPal[who.idx % flPal.length] || flPal[hash(who.name) % flPal.length] };
  };
  const jobState = (job) => (job.end === null ? 'bekerja' : now - job.end < CD ? 'selesai' : 'santai');
  const task = (r) => (r.description !== '' ? r.description : r.agentType);
  const runOut = (job) => {
    const r = job.run;
    const lastJob = r.effSegs.length - 1 === job.k;
    return {
      id: r.id,
      agent_type: r.agentType,
      task: task(r),
      status: lastJob ? r.status : 'selesai',
      reason: lastJob ? r.reason : null,
      segment: job.k + 1,
      started: job.startIso,
      ended: job.end === null ? null : job.endIso,
      updated: r.updated,
      last: [...r.events].reverse().slice(0, 8),
      files: r.files.slice(-6),
      tools: r.tools,
      tokens: r.tokens,
    };
  };

  const team = pool.map((slot, i) => {
    const info = charInfo({ kind: 'pool', idx: i }, null);
    return { ...info, kind: 'tim', slot: i, desk: i, state: slot.job ? jobState(slot.job) : 'santai', run: slot.job ? runOut(slot.job) : null };
  });
  const studio = studioSpecialists.map((sp, j) => {
    const slot = fl[j];
    const info = charInfo({ kind: 'studio', idx: j }, slot?.job?.run || null);
    const st = slot && slot.job ? jobState(slot.job) : 'santai';
    return {
      ...info,
      kind: 'studio',
      slot: j,
      desk: `B${j}`,
      state: st,
      run: slot && slot.job ? runOut(slot.job) : null
    };
  });
  const freelancers = [];
  fl.slice(studioSpecialists.length).forEach((slot, j) => {
    const actualIdx = j + studioSpecialists.length;
    if (slot.job === null) return;
    const st = jobState(slot.job);
    if (st === 'santai') return;
    const info = charInfo({ kind: 'fl', idx: actualIdx, name: slot.name }, slot.job.run);
    freelancers.push({ ...info, kind: 'freelancer', slot: actualIdx, desk: actualIdx < cfg.spare_desks ? actualIdx : null, state: st, run: runOut(slot.job) });
  });

  // ---- Ketua (sesi utama) — teks jawaban sesi utama tidak pernah ditampilkan, hanya aksi alat & penanda instruksi user
  const kids = new Map();
  for (const r of runs) if (r.status === 'bekerja') kids.set(r.session, (kids.get(r.session) ?? 0) + 1);
  const mains = scan.mains.filter((m) => m.updated !== null)
    .sort((a, b) => cmp(tsMs(b.updated), tsMs(a.updated)) || strcmp(a.session, b.session));
  const mainState = (m) => {
    const age = now - tsMs(m.updated);
    const k = kids.get(m.session) ?? 0;
    if (m.lastKind !== 'final' && age <= MA) return ['bekerja', 'aktif'];
    if (m.lastKind === 'tool' && age <= RW) return ['bekerja', 'alat'];
    if (k > 0) return ['bekerja', 'menunggu-tim'];
    if (m.lastKind === 'final' && age < CD) return ['selesai', null];
    return ['santai', null];
  };
  const states = mains.map(mainState);
  let di = states.findIndex((s) => s[0] === 'bekerja');
  if (di < 0) di = mains.length ? 0 : -1;
  const dm = di >= 0 ? mains[di] : null;
  const activeMains = states.filter((s) => s[0] === 'bekerja').length;
  const ketua = {
    key: 'ketua', name: cfg.ketua, label: scan.account?.alias ? `${cfg.ketua} (${scan.account.alias})` : cfg.ketua, role: 'Ketua', kind: 'ketua', color: ketuaColor,
    state: dm ? states[di][0] : 'santai',
    activity: dm ? states[di][1] : null,
    session: dm ? dm.session.slice(0, 8) : null,
    updated: dm ? dm.updated : null,
    last: dm ? [...dm.events].reverse().filter((e) => e.kind !== 'text' && e.tool !== 'Agent' && e.tool !== 'Task').slice(0, 8) : [],
    tools: dm ? dm.tools : 0,
    tokens: dm ? dm.tokens : 0,
    waiting_on: dm ? kids.get(dm.session) ?? 0 : 0,
    other_sessions: Math.max(0, activeMains - (dm && states[di][0] === 'bekerja' ? 1 : 0)),
    sessions: mains.length,
    todos: dm && dm.todos !== null ? { items: dm.todos, at: dm.todosAt, source: dm.todoSource } : null,
  };

  // ---- feed
  const K = { key: 'ketua', name: cfg.ketua, label: cfg.ketua, color: ketuaColor };
  const feed = [];
  const add = (t, ms, who, kind, text, tool) => feed.push({ ms, e: { t, who: who.key, name: who.label, color: who.color, kind, text, tool } });
  for (const m of mains) {
    for (const e of m.events) {
      if (e.kind === 'text' || e.tool === 'Agent' || e.tool === 'Task') continue;
      add(e.t, tsMs(e.t), K, e.kind, e.text, e.tool);
    }
  }
  for (const job of jobs) {
    const r = job.run;
    const who = charInfo(job.who, r);
    if (job.k === 0) {
      const parent = r.parentAgent !== null && byId.has(r.parentAgent) ? byId.get(r.parentAgent) : null;
      const req = parent !== null ? charInfo(charOf.get(parent.id), parent) : K;
      add(job.startIso, job.start, req, 'assign', `${req.label} meminta ${who.label}: ${task(r)}`, null);
    } else {
      add(job.startIso, job.start, who, 'resume', `${who.label} melanjutkan: ${task(r)}`, null);
    }
    if (job.end !== null && job.end <= now) {
      const lastJob = r.effSegs.length - 1 === job.k;
      let text = `${who.label} selesai: ${task(r)}`;
      if (lastJob && r.status === 'limit') text = `${who.label} jeda — limit pemakaian`;
      else if (lastJob && r.reason === 'dihentikan') text = `${who.label} dihentikan: ${task(r)}`;
      else if (lastJob && r.reason === 'tidak-aktif') text = `${who.label} berhenti — tidak ada aktivitas ${Math.round(cfg.running_window / 60)} menit`;
      add(job.endIso, job.end, who, 'done', text, null);
    }
  }
  const jobsOf = new Map();
  for (const job of jobs) {
    if (!jobsOf.has(job.run.id)) jobsOf.set(job.run.id, []);
    jobsOf.get(job.run.id).push(job);
  }
  for (const r of runs) {
    const js = jobsOf.get(r.id) ?? [];
    for (const e of r.events) {
      const ms = tsMs(e.t);
      let job = js[0];
      for (const j of js) if (j.start <= ms) job = j;
      add(e.t, ms, charInfo(job.who, r), e.kind, e.text, e.tool);
    }
  }
  // urut terbaru dulu; peristiwa tugas (meminta/lanjut/selesai) punya jatah sendiri agar tidak tergeser aksi alat
  const order = feed.map((f, i) => [f, i]);
  order.sort((a, b) => cmp(b[0].ms, a[0].ms) || cmp(a[1], b[1]));
  const LIFE = new Set(['assign', 'resume', 'done']);
  const life = order.filter((x) => LIFE.has(x[0].e.kind)).slice(0, 60);
  const acts = order.filter((x) => !LIFE.has(x[0].e.kind)).slice(0, 120);
  const merged = [...life, ...acts].sort((a, b) => cmp(b[0].ms, a[0].ms) || cmp(a[1], b[1]));

  // ---- riwayat & statistik
  const hist = [...runs].sort((a, b) => cmp(tsMs(b.started), tsMs(a.started)) || strcmp(a.id, b.id)).slice(0, 40).map((r) => {
    const js = jobsOf.get(r.id);
    const job = js[js.length - 1];
    const who = charInfo(job.who, r);
    return {
      id: r.id, who: who.key, name: who.name, label: who.label, color: who.color, kind: job.who.kind === 'pool' ? 'tim' : 'freelancer',
      agent_type: r.agentType, task: task(r), status: r.status, started: r.started, ended: job.end === null ? null : job.endIso, tools: r.tools,
    };
  });
  const recent = runs.filter((r) => now - tsMs(r.started) <= 48 * 3600 * 1000).map((r) => r.started);

  let tunnel = phpTrim(readText(storageDir ? path.join(storageDir, 'tunnel-url.txt') : '') ?? '');
  if (!/^https:\/\/[A-Za-z0-9.-]+(:\d+)?\/kerja$/.test(tunnel)) tunnel = '';

  return {
    app: 'kantor-agent',
    version: VERSION,
    now: isoMs(now),
    project: cfg.title,
    account: scan.account || null,
    names: [cfg.ketua, ...cfg.team].join('|'),
    transcripts: scan.exists,
    ketua,
    team,
    studio,
    freelancers,
    feed: merged.map((x) => x[0].e),
    runs: hist,
    stats: {
      active: runs.filter((r) => r.status === 'bekerja').length,
      freelancers: freelancers.filter((f) => f.state === 'bekerja').length,
      total: runs.length,
      recent_starts: recent,
      sessions_active: activeMains,
    },
    spare_desks: cfg.spare_desks,
    public_url: tunnel !== '' ? tunnel : null,
  };
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
