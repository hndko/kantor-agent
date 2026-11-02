// Adapter Antigravity untuk Kantor Agent
// Membaca log transkrip dari ~/.gemini/antigravity/brain/
// dan mendeteksi akun aktif dari ~/.gemini/google_accounts.json
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  clip, isDir, isFile, isPlainObj, mtimeSec, oneLine, safeLine, tsMs,
} from './util.mjs';

const EVENTS_KEEP = 40;
const FILES_KEEP = 12;

export function getGeminiHome() {
  const home = process.env.HOME || os.userInfo().homedir || '';
  return path.join(home.replace(/\/+$/, ''), '.gemini');
}

// Deteksi akun aktif Google / Antigravity yang sedang login
export function getActiveAccount() {
  const geminiHome = getGeminiHome();
  const accountsFile = path.join(geminiHome, 'google_accounts.json');
  try {
    if (isFile(accountsFile)) {
      const data = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
      if (typeof data.active === 'string' && data.active.trim()) {
        const email = data.active.trim();
        const alias = email.split('@')[0];
        return {
          email,
          alias,
          label: `${alias} (${email})`,
          all: Array.isArray(data.old) ? [email, ...data.old] : [email],
        };
      }
    }
  } catch {
    // abaikan jika parsing gagal
  }

  // Fallback ke environment variable atau nama user sistem
  const envUser = process.env.AGY_ACCOUNT || process.env.GEMINI_ACCOUNT || process.env.USERNAME || process.env.USER || 'Antigravity';
  return {
    email: envUser,
    alias: envUser.split('@')[0],
    label: envUser,
    all: [envUser],
  };
}

export function antigravityBrainDir() {
  if (process.env.ANTIGRAVITY_BRAIN_DIR) return path.resolve(process.env.ANTIGRAVITY_BRAIN_DIR);
  return path.join(getGeminiHome(), 'antigravity', 'brain');
}

export function antigravityPresenceDir() {
  return path.join(getGeminiHome(), 'antigravity', 'presence');
}

// Format deskripsi tool call Antigravity agar sesuai dengan Three.js feed & whiteboard
export function describeAntigravityTool(name, args = {}) {
  let p = null;
  let text = '';
  const cleanStr = (s) => (typeof s === 'string' ? s.replace(/^["']|["']$/g, '').trim() : '');

  switch (name) {
    case 'read_file': {
      const raw = cleanStr(args.Path);
      p = raw ? path.basename(raw) : '';
      text = `Membaca ${p || 'file'}`;
      break;
    }
    case 'write_file': {
      const raw = cleanStr(args.Path);
      p = raw ? path.basename(raw) : '';
      text = `Menulis ${p || 'file'}`;
      break;
    }
    case 'edit_file': {
      const raw = cleanStr(args.Path);
      p = raw ? path.basename(raw) : '';
      text = `Mengubah ${p || 'file'}`;
      break;
    }
    case 'run_command': {
      const summary = cleanStr(args.toolSummary) || cleanStr(args.CommandLine).split('\n')[0].slice(0, 60);
      text = `Menjalankan: ${summary || 'perintah terminal'}`;
      break;
    }
    case 'invoke_subagent': {
      const role = cleanStr(args.Role) || cleanStr(args.TypeName) || 'subagent';
      text = `Mendelegasikan ke: ${role}`;
      break;
    }
    case 'send_message': {
      text = 'Mengirim pesan ke agent';
      break;
    }
    case 'manage_subagents': {
      text = `Mengelola subagent (${cleanStr(args.Action) || 'status'})`;
      break;
    }
    case 'manage_task': {
      text = `Background task: ${cleanStr(args.Action) || 'status'}`;
      break;
    }
    case 'search_web': {
      const q = cleanStr(args.query);
      text = `Riset web: ${clip(q, 45)}`;
      break;
    }
    case 'ask_question': {
      text = 'Bertanya ke user';
      break;
    }
    case 'call_mcp_tool': {
      const s = cleanStr(args.ServerName);
      const t = cleanStr(args.ToolName);
      text = `Alat MCP: ${s ? `${s}.${t}` : t || 'tool'}`;
      break;
    }
    case 'search_marketplace': {
      text = 'Mencari di marketplace';
      break;
    }
    default:
      text = `Alat: ${clip(name, 50)}`;
  }
  return [oneLine(text, 160), p];
}

export class AntigravityScanner {
  constructor(storageDir, cfg) {
    this.storageDir = storageDir;
    this.cfg = cfg;
  }

  scan(nowSec) {
    const brainDir = antigravityBrainDir();
    if (!isDir(brainDir)) return { exists: false, runs: [], mains: [], account: getActiveAccount() };

    const cutoff = nowSec - this.cfg.window_days * 86400;
    const presenceDir = antigravityPresenceDir();
    const activeLocks = new Set();
    if (isDir(presenceDir)) {
      try {
        for (const f of fs.readdirSync(presenceDir)) {
          if (f.endsWith('.lock')) activeLocks.add(f.slice(0, -5));
        }
      } catch {
        /* abaikan */
      }
    }

    // Temukan semua folder percakapan yang valid
    const convDirs = [];
    try {
      for (const entry of fs.readdirSync(brainDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === 'tempmediaStorage' || entry.name.length !== 36) continue;
        const logPath = path.join(brainDir, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
        if (isFile(logPath)) {
          const mt = mtimeSec(logPath);
          if (mt >= cutoff) {
            convDirs.push({
              id: entry.name,
              logPath,
              mtime: mt,
              isLocked: activeLocks.has(entry.name),
            });
          }
        }
      }
    } catch {
      return { exists: false, runs: [], mains: [], account: getActiveAccount() };
    }

    if (convDirs.length === 0) {
      return { exists: false, runs: [], mains: [], account: getActiveAccount() };
    }

    // Pass 1: Kumpulkan semua pemanggilan invoke_subagent beserta conversationId-nya
    // Agar kita bisa membedakan mana SESI UTAMA (Joko) dan mana SUBAGENT (Budi, Sari, dll)
    const subagentsMap = new Map(); // subagentId -> { role, type, prompt, parentId, t }
    const allSubagentIds = new Set();

    for (const c of convDirs) {
      try {
        const lines = fs.readFileSync(c.logPath, 'utf8').trim().split('\n');
        let pendingMeta = null;
        for (const line of lines) {
          if (!line.trim()) continue;
          let row;
          try {
            row = JSON.parse(line);
          } catch {
            continue;
          }

          const t = row.created_at || '';
          if (row.type === 'PLANNER_RESPONSE' && Array.isArray(row.tool_calls)) {
            for (const tc of row.tool_calls) {
              if (tc.name === 'invoke_subagent' && tc.args) {
                const role = String(tc.args.Role || tc.args.TypeName || 'subagent').replace(/^["']|["']$/g, '');
                const type = String(tc.args.TypeName || 'general').replace(/^["']|["']$/g, '');
                const prompt = String(tc.args.Prompt || '').replace(/^["']|["']$/g, '');
                pendingMeta = { role, type, prompt, parentId: c.id, t };
              }
            }
          } else if (row.type === 'GENERIC' && pendingMeta && row.content) {
            const matches = row.content.matchAll(/"conversationId":\s*"([a-f0-9-]{36})"/gi);
            for (const m of matches) {
              const subId = m[1];
              allSubagentIds.add(subId);
              subagentsMap.set(subId, { ...pendingMeta, id: subId });
            }
            pendingMeta = null;
          }
        }
      } catch {
        /* abaikan */
      }
    }

    // Urutkan: sesi aktif (lock) di atas, lalu berdasarkan mtime
    convDirs.sort((a, b) => (b.isLocked ? 1 : 0) - (a.isLocked ? 1 : 0) || b.mtime - a.mtime);

    // Filter kandidat sesi utama: JANGAN sertakan percakapan yang merupakan subagent!
    const mainCandidates = convDirs.filter((c) => !allSubagentIds.has(c.id)).slice(0, this.cfg.mains_max);
    const mains = [];

    for (const c of mainCandidates) {
      const sum = this.summarize(c.logPath, c.id);
      if (sum.started === null) continue;
      mains.push({
        ...sum,
        session: c.id,
      });
    }

    // Susun runs untuk subagents
    const runs = [];
    for (const [subId, meta] of subagentsMap.entries()) {
      const subLog = path.join(brainDir, subId, '.system_generated', 'logs', 'transcript.jsonl');
      let subSum = isFile(subLog) ? this.summarize(subLog, subId) : null;

      if (!subSum || subSum.started === null) {
        // Buat run sintetis berbasis waktu panggil jika transcript belum ada
        const startT = meta.t || new Date().toISOString();
        subSum = {
          started: startT,
          updated: startT,
          tools: 1,
          tokens: 0,
          events: [{ t: startT, kind: 'tool', text: `Menjalankan: ${meta.role}`, tool: 'subagent' }],
          lastKind: 'tool',
          limit: null,
          files: [],
          todos: null,
          todosAt: null,
          todoSource: null,
          segs: [[startT, null]], // null = sedang berjalan aktif
          stops: [],
        };
      } else {
        // Pastikan segmen subagent terkelola dengan benar:
        // Jika belum selesai (lastKind bukan final), segmen HARUS bernilai [started, null]
        // agar statusnya 'bekerja' di Three.js!
        if (subSum.lastKind !== 'final') {
          subSum.segs = [[subSum.started, null]];
        } else {
          subSum.segs = [[subSum.started, subSum.updated]];
        }
      }

      runs.push({
        ...subSum,
        id: subId.slice(0, 8),
        session: meta.parentId,
        agentType: clip(meta.type || 'subagent', 40),
        description: safeLine(meta.role || meta.prompt || 'Subagent task', 140),
        parentAgent: meta.parentId,
      });
    }

    const account = getActiveAccount();
    return {
      exists: true,
      runs,
      mains,
      account,
    };
  }

  summarize(filePath, sessionId) {
    let lines = [];
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      lines = content.trim().split('\n');
    } catch {
      return this.emptySummary();
    }

    const s = this.emptySummary();
    const taskList = [];
    const seenTasks = new Set();
    const addTask = (text, status, at) => {
      let clean = String(text || '').replace(/<[^>]+>/g, '').trim();
      clean = clean.replace(/^[\d+.\-*\s]+/, '').trim();
      if (!clean || clean.length < 3) return;
      const shortText = clean.length > 115 ? clean.slice(0, 112) + '…' : clean;
      const key = shortText.toLowerCase();
      if (seenTasks.has(key)) return;
      seenTasks.add(key);
      taskList.push({ text: shortText, status, at });
    };

    for (const line of lines) {
      if (!line.trim()) continue;
      let row;
      try {
        row = JSON.parse(line);
      } catch {
        continue;
      }

      const t = typeof row.created_at === 'string' ? row.created_at : '';
      if (t !== '') {
        if (s.started === null) s.started = t;
        s.updated = t;
      }

      if (row.type === 'USER_INPUT') {
        const rawContent = typeof row.content === 'string' ? row.content : '';
        // 1. Ekstrak riwayat User Requests dari CONTEXT_SUMMARY jika ada
        const contextMatch = rawContent.match(/# User Requests[\s\S]*?The following were the most recent user requests in chronological order:([\s\S]*?)(?:<\/CONTEXT_SUMMARY>|# Previous Session Summary)/i);
        if (contextMatch) {
          const reqLines = contextMatch[1].trim().split('\n');
          for (const rl of reqLines) {
            const m = rl.match(/^\d+\.\s*(.+)/);
            if (m) addTask(m[1], 'completed', t);
          }
        }
        // 2. Ekstrak USER_REQUEST saat ini
        const reqMatch = rawContent.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/i);
        if (reqMatch) {
          addTask(reqMatch[1].trim(), 'completed', t);
        } else {
          const cleaned = rawContent
            .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/gi, '')
            .replace(/<CONTEXT_SUMMARY>[\s\S]*?<\/CONTEXT_SUMMARY>/gi, '')
            .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/gi, '')
            .trim();
          const firstLine = cleaned.split('\n')[0].trim();
          if (firstLine && !firstLine.startsWith('<')) {
            addTask(firstLine, 'completed', t);
          }
        }

        const cleaned = rawContent
          .replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '')
          .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')
          .replace(/<CONTEXT_SUMMARY>[\s\S]*?<\/CONTEXT_SUMMARY>/g, '')
          .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '')
          .trim();
        const firstLine = cleaned.split('\n')[0].trim();
        if (firstLine) {
          this.pushEvent(s, t, 'user', `Instruksi user: ${clip(firstLine, 90)}`, null);
        }
        s.lastKind = 'user';
        if (t !== '') s.segs.push([t, null]);
      } else if (row.type === 'PLANNER_RESPONSE') {
        s.tokens.in += Number(row.input_tokens || 0);
        s.tokens.out += Number(row.output_tokens || 0);
        s.tokens.cache += Number(row.cache_read_tokens || 0);

        if (Array.isArray(row.tool_calls) && row.tool_calls.length > 0) {
          for (const tc of row.tool_calls) {
            s.tools++;
            const name = typeof tc.name === 'string' ? tc.name : 'tool';
            const args = isPlainObj(tc.args) ? tc.args : {};
            const [desc, file] = describeAntigravityTool(name, args);

            if (file) {
              s.files = s.files.filter((f) => f !== file);
              s.files.push(file);
              if (s.files.length > FILES_KEEP) s.files.shift();
            }

            this.pushEvent(s, t, 'tool', desc, name);
          }
          s.lastKind = 'tool';
        } else if (typeof row.content === 'string' && row.content.trim()) {
          const firstLine = row.content.trim().split('\n')[0];
          this.pushEvent(s, t, 'text', safeLine(firstLine, 180), null);
          s.lastKind = 'final';
          if (s.segs.length && s.segs[s.segs.length - 1][1] === null) {
            s.segs[s.segs.length - 1][1] = t;
          }
        } else if (row.thinking) {
          this.pushEvent(s, t, 'text', 'Sedang menganalisis langkah...', null);
          s.lastKind = 'thinking';
        }
      } else if (row.type === 'GENERIC') {
        if (row.status === 'RUNNING') {
          s.lastKind = 'tool';
        }
      }
    }

    // Pastikan selalu ada minimal satu work segment jika sesi memiliki waktu mulai
    if (s.started && s.segs.length === 0) {
      s.segs.push([s.started, s.lastKind === 'final' ? s.updated : null]);
    }

    // Susun daftar tugas sesi Ketua (Joko) dari permintaan pengguna dan aktivitas
    if (taskList.length > 0) {
      if (s.lastKind !== 'final') {
        taskList[taskList.length - 1].status = 'in_progress';
      }
      // Prioritaskan tugas belum selesai (in_progress, pending) di posisi paling atas,
      // disusul tugas selesai (completed) secara kronologis terbalik (terbaru dulu).
      const statusWeight = { in_progress: 0, pending: 1, completed: 2 };
      const sorted = [...taskList].sort((a, b) => {
        const wa = statusWeight[a.status] ?? 1;
        const wb = statusWeight[b.status] ?? 1;
        if (wa !== wb) return wa - wb;
        const ta = a.at ? new Date(a.at).getTime() : 0;
        const tb = b.at ? new Date(b.at).getTime() : 0;
        return tb - ta;
      });
      s.todos = sorted.slice(0, 30);
      s.todosAt = s.updated || s.started || new Date().toISOString();
      s.todoSource = 'Antigravity Session & User Requests';
    }

    return {
      started: s.started,
      updated: s.updated,
      tools: s.tools,
      tokens: s.tokens.in + s.tokens.out + s.tokens.cache,
      events: s.events,
      lastKind: s.lastKind,
      limit: s.limit,
      files: s.files,
      todos: s.todos,
      todosAt: s.todosAt,
      todoSource: s.todoSource,
      segs: s.segs,
      stops: s.stops,
    };
  }

  pushEvent(s, t, kind, text, tool) {
    if (!t) return;
    s.events.push({ t, kind, text, tool });
    if (s.events.length > EVENTS_KEEP) s.events.splice(0, s.events.length - EVENTS_KEEP);
  }

  emptySummary() {
    return {
      started: null,
      updated: null,
      tools: 0,
      tokens: { in: 0, out: 0, cache: 0 },
      events: [],
      lastKind: null,
      limit: null,
      files: [],
      todos: null,
      todosAt: null,
      todoSource: null,
      segs: [],
      stops: [],
    };
  }
}
