# Kantor Mari Partner (Kantor Agent) — Lihat Google Antigravity & Claude Code Bekerja di Kantor 3D

> **English summary.** Kantor Mari Partner (Kantor Agent) is a zero-config 3D office visualizer (three.js) supporting both **Google Antigravity** and **Claude Code**.
> The main session is the team lead **Joko**, working at his own desk. The core team — **Budi, Sari, Agus, Rina** — and the studio specialists — **Yoga, Dewi, Rudi, Maya** —
> lounge in the break area and walk to their desks whenever subagents are dispatched. Features an expanded **Lab & Testing Wing** with 4 Standby PCs, a 42U server rack,
> an AOI inspection camera rig, and a live architecture whiteboard. Fully supports Windows (PowerShell & Batch), macOS, and Linux without external database setup. MIT licensed.

![Kantor Agent — tim sedang bekerja](docs/kantor-bekerja.webp)

**Kantor Mari Partner** memperlihatkan apa yang sedang dikerjakan **Google Antigravity** maupun **Claude Code** secara real-time dalam bentuk simulasi visual kantor 3D yang interaktif dan estetik.
Tanpa data karangan, tanpa login tambahan, dan tanpa konfigurasi rumit — seluruh aktivitas digerakkan langsung oleh transkrip nyata sesi utama dan subagent lokal Anda.

## Daftar isi
- [Fitur Utama](#fitur-utama) · [Denah 13 PC & 2 Ruangan](#denah-13-pc--2-ruangan) · [Kebutuhan](#kebutuhan)
- [Mulai Cepat di Windows (Google Antigravity)](#mulai-cepat-di-windows-google-antigravity) · [Mulai Cepat di Claude Code](#mulai-cepat-di-claude-code)
- [Cara Kerja Antigravity & Claude](#cara-kerja-antigravity--claude) · [Pelacakan Tugas Joko](#pelacakan-tugas-joko)
- [Tim, Studio & Lab](#tim-studio--lab) · [URL Publik (Tunnel)](#url-publik-tunnel) · [Lisensi](#lisensi)

## Fitur Utama
- **Mendukung Google Antigravity & Claude Code**: Otomatis mendeteksi transkrip dari `~/.gemini/antigravity/brain/` maupun `~/.claude/projects/`, lengkap dengan deteksi akun Google yang sedang aktif login.
- **2 Ruangan Terhubung (Main Office & Sayap Lab Testing)**: Ruangan kerja utama terhubung dengan partisi kaca dan plakat akrilik neon ke ruang lab riset canggih.
- **13 Komputer PC Interaktif**:
  - **Meja A0**: Joko (Ketua / Sesi Utama).
  - **Baris A (Tim Inti)**: Budi (System Architect), Sari (Core Dev), Agus (Memory Auditor), Rina (QA Lead).
  - **Baris B (Studio Spesialis)**: Yoga (Database Architect), Dewi (API Integrator), Rudi (Mobile Specialist), Maya (Cybersec Officer).
  - **Baris C (Lab Standby PCs)**: 4 PC Standby telemetri di ruang lab yang siap digunakan subagent baru kapan pun dibutuhkan.
- **Fasilitas Laboratorium Canggih**: Server rack industrial 42U dengan lampu LED berkedip, workbench kamera inspeksi AOI telecentric & osiloskop digital, serta architectural glass whiteboard.
- **Pelacakan Tugas Nyata ("Tugas Joko")**: Mengekstrak daftar instruksi pengguna (`USER_REQUEST`) dan rencana tugas secara otomatis dengan status *Selesai* (`✓`), *Sedang Dikerjakan* (`▶`), dan *Rencana* (`○`).
- **168+ Percakapan Interaktif (Anti-Repeat Deck Shuffle)**: Dialog obrolan kocak seputar kuliner, koding, debugging, dan proyek tim menggunakan algoritma Fisher-Yates sehingga percakapan tidak berulang.
- **Skrip Kontrol Lengkap di Windows**: Disediakan `kantor.ps1`, `start-kantor.bat`, dan `stop-kantor.bat` untuk menjalankan dan menghentikan visualizer dengan satu klik.
- **Performa Ringan & Nol Ketergantungan**: Berjalan lancar di Node.js ≥ 18 tanpa memerlukan `npm install`, mendukung rotasi kamera bebas (OrbitControls), dan ramah tampilan ponsel.

## Denah 13 PC & 2 Ruangan

```text
[ RUANGAN UTAMA (MAIN OFFICE) ]                       ║ [ SAYAP LAB & TESTING (MARI PARTNER LAB) ]
                                                      ║
 Meja A0 (Joko - Ketua / Sesi Utama)                  ║
 Baris A (Tim Inti):                                  ║ Baris C (Lab Standby):
   A1: Budi  (System Architect)                       ║   C0: Lab PC 1 (Standby Telemetry)
   A2: Sari  (Core Developer)                         ║   C1: Lab PC 2 (Standby Telemetry)
   A3: Agus  (Memory Auditor)     [ PINTU KACA ]      ║   C2: Lab PC 3 (Standby Telemetry)
   A4: Rina  (QA Lead)            [ MARI PARTNER LAB] ║   C3: Lab PC 4 (Standby Telemetry)
                                  ═══════════════════ ║
 Baris B (Studio Spesialis):                          ║ Fasilitas Lab:
   B0: Yoga  (Database Architect)                     ║   • 42U Server Rack (LED Blinking)
   B1: Dewi  (API Integrator)                         ║   • AOI Camera Rig & Oscilloscope
   B2: Rudi  (Mobile Specialist)                      ║   • Glass Whiteboard Arsitektur
   B3: Maya  (Cybersecurity Auditor)                  ║
```

## Mulai Cepat di Windows (Google Antigravity)
Jalankan salah satu cara berikut:
1. **Menggunakan PowerShell Script**:
   ```powershell
   .\kantor.ps1 start
   # Buka http://127.0.0.1:8788/kerja di browser
   # Hentikan: .\kantor.ps1 stop
   ```
2. **Atau Dobel-Klik Batch File**:
   - `start-kantor.bat` (menyalakan server dan membuka browser otomatis).
   - `stop-kantor.bat` (menghentikan server).

## 🧰 Bundled Skills & Presets (17 Skills Terintegrasi)

Seluruh skill dan preset tim yang dirancang untuk Kantor Mari Partner sudah dibundel langsung di folder `skills/`.

### ⚡ Pasang Seluruh Skill ke Komputer Baru (1-Klik Auto-Install)
Ketika Anda clone repository ini ke komputer baru, pasang seluruh 17 skill & preset ke Google Antigravity dan Claude Code secara global cukup dengan satu perintah:

- **Windows (PowerShell)**:
  ```powershell
  .\kantor.ps1 install-skills
  # atau:
  .\install-skills.ps1
  ```
- **macOS / Linux / WSL**:
  ```bash
  chmod +x install-skills.sh && ./install-skills.sh
  ```
Setelah dijalankan, seluruh preset seperti `/studio-team`, `/fullstack-team`, `/db-team`, `/api-team`, `/kantor-agent`, dll. akan langsung aktif dan bisa dipanggil dari folder project mana pun di komputer tersebut!

### 1. Spesialis Studio (Baris B)
- `skills/database-architect/` : **Yoga** — Senior Database, Indexing, SQLite WAL & Redis Cache Architect.
- `skills/api-integrator/` : **Dewi** — Senior RESTful API, OpenAPI 3.0, Swagger & Webhook Exponential Retry.
- `skills/mobile-architect/` : **Rudi** — Modern Android, Jetpack Compose, Kotlin Flow & 120 FPS Recomposition.
- `skills/cybersec-officer/` : **Maya** — Senior Cybersecurity, Penetration Testing, OWASP Top 10 & RBAC Auditor.

### 2. Multi-Agent Team Presets
- `skills/studio-team/` : **Studio Team** — Formasi lengkap 8 subagent senior di bawah komando Joko.
- `skills/db-team/` : **Database & Cache Team** — Yoga (DB), Agus (Perf), Rina (QA Data).
- `skills/api-team/` : **API & Cloud Team** — Dewi (API), Maya (Security), Rina (Contract QA).
- `skills/mobile-team/` : **Mobile Systems Team** — Rudi (Android), Dewi (API/Data), Rina (QA).
- `skills/security-audit/` : **Security Hardening Team** — Maya (Cybersec), Agus (Memory), Budi (Architect).
- `skills/aoi-team/` : **AOI Industrial Team** — Budi, Sari, Agus, Rina untuk proyek C# .NET 10 & OpenCV.
- `skills/fullstack-team/` : **Fullstack Multi-Stack Team** — Budi, Sari, Agus, Rina untuk segala framework.

### 3. Engineering Stack Specialists
- `skills/vision-inspector-expert/` : C# .NET 10, OpenCvSharp4, zero-blocking UI & native Mat disposal.
- `skills/android-expert/` : Modern Android Development (Compose, Room DB, Coroutines, StateFlow).
- `skills/laravel-expert/` : Laravel 11/12 Clean Architecture (Action/Service pattern, Pest testing).
- `skills/vue-expert/` : Vue 3 Composition API, Pinia, TypeScript, Vitest & Playwright.
- `skills/codeigniter-expert/` : CodeIgniter 3 Modernization (PHP 8, CSRF) & CodeIgniter 4 Architecture.

### 4. Controller Kantor 3D
- `skills/kantor-agent/` : Server runtime Kantor Mari Partner 3D & protokol auto-dispatch Antigravity.

## Kebutuhan
| Komponen | Keterangan |
|---|---|
| **Claude Code** | Versi dengan dukungan plugin (`/plugin`) dan subagent. Diuji di v2.1.283. Pasang manual: versi apa pun yang mendukung skills. |
| **Node ≥ 18** *(disarankan)* **atau PHP ≥ 8.1** (+ `mbstring`) | Salah satu cukup. Node dipakai bila ada, selain itu PHP. |
| bash, `curl` | Sudah ada di macOS & Linux. Windows: jalankan Claude Code di WSL. |
| Browser dengan WebGL | Chrome, Edge, Firefox, Safari modern (desktop & ponsel). |
| [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | Opsional — hanya untuk URL publik sementara. |

## Mulai cepat (plugin)
Di Claude Code (sesi mana pun):
```text
/plugin marketplace add humaedihume/kantor-agent
/plugin install kantor-agent@kantor-agent
/reload-plugins
```
Atau dari terminal: `claude plugin marketplace add humaedihume/kantor-agent && claude plugin install kantor-agent@kantor-agent`.

Lalu, **di folder project yang ingin dipantau**:
```text
/kantor-agent:kantor-agent
```
Keluaran kira-kira:
```text
Kantor Agent berjalan (node) untuk project: toko-kue
  URL      : http://127.0.0.1:8788/kerja
  Hentikan : bash "…/skills/kantor-agent/runtime/bin/kantor.sh" stop
```
Buka URL itu di browser. Perintah lain: `/kantor-agent:kantor-agent status`, `… stop`, `… publik` (URL publik),
`… tutup-publik`. Kamu juga cukup bilang "nyalakan kantor agent"; Claude akan memakai skill ini.

## Pasang manual
Tanpa sistem plugin — skill biasa bernama `/kantor-agent`:
```bash
git clone https://github.com/humaedihume/kantor-agent.git
mkdir -p ~/.claude/skills
ln -s "$PWD/kantor-agent/skills/kantor-agent" ~/.claude/skills/kantor-agent   # atau: cp -R … ~/.claude/skills/
```
Buka sesi Claude Code baru di folder project lalu jalankan `/kantor-agent`. Tanpa Claude pun bisa, langsung dari
terminal di folder project:
```bash
bash ~/.claude/skills/kantor-agent/runtime/bin/kantor.sh start     # stop | status | restart | url | tunnel | detect
```
> Jangan memasang versi plugin **dan** manual bersamaan — keduanya akan tampil (`/kantor-agent:kantor-agent` dan
> `/kantor-agent`). Pilih salah satu.

## Cara kerja
```text
~/.claude/projects/<slug-project>/<sesi>.jsonl                          ← sesi utama  → Ketua (Joko)
                                 /<sesi>/subagents/agent-<id>.jsonl      ← subagent    → Tim / Freelancer
                                 /<sesi>/subagents/agent-<id>.meta.json    {agentType, description, parentAgentId}
                                 /<sesi>/subagents/workflows/<wf>/agent-*  (subagent workflow)
        │  dibaca read-only & inkremental; hanya ringkasan tool_use — isi tool_result TIDAK pernah dibaca
        ▼
skills/kantor-agent/runtime/   (dijalankan langsung dari folder plugin — tidak disalin ke project)
  bin/kantor.sh ── pilih runtime & port bebas ──┬─ Node:  bin/serve-node.mjs + lib/node/*.mjs
                                                └─ PHP:   php -S … public/index.php + lib/php/*.php
        │  cache, PID, log → ~/.cache/kantor-agent/<slug-project>/
        ├── GET /kerja            halaman (views/page.html)
        ├── GET /kerja/api/state  JSON status, dipolling tiap 3 detik
        ├── GET /kerja/api/ping   identitas server (untuk start/stop idempoten)
        └── GET /kerja/assets/*   three.js r170 (vendored) + kantor.js
        ▼
Browser: kantor 3D — meja Ketua, 4 meja tim, 4 meja cadangan, lounge, pintu, papan tulis, panel & kartu
```
- `<slug-project>` = path absolut project dengan setiap karakter non-alfanumerik diganti `-` (sama seperti Claude Code).
- Folder transkrip mengikuti `CLAUDE_CONFIG_DIR` (bila di-set) atau `HOME` — server berjalan sebagai user yang sama.
- **Status subagent:** *bekerja* (belum ada jawaban akhir & ada aktivitas ≤ 15 menit), *selesai* (jawaban akhir),
  *terhenti* (`TaskStop` dari sesi mana pun, atau tanpa aktivitas > 15 menit), *limit* (pesan batas pemakaian).
- **Status Ketua:** *bekerja* bila sesi utama aktif ≤ 90 detik, sedang menjalankan alat, atau menunggu subagent-nya;
  *selesai* sesaat setelah giliran berakhir; selain itu *santai*.

## Tim & freelancer
Penugasan dihitung ulang dari data setiap 3 detik dengan simulasi urut waktu, sehingga **selalu sama** untuk data
yang sama (aman dimuat ulang, identik di Node dan PHP):
1. Semua "job" subagent 7 hari terakhir diurutkan menurut waktu mulai.
2. Anggota tim **bebas** bila belum bertugas atau job terakhirnya selesai ≥ 60 detik sebelumnya. Job baru diberikan
   ke anggota bebas **pertama** menurut urutan tetap: Budi → Sari → Agus → Rina (masing-masing punya meja sendiri).
3. Keempatnya sibuk → **freelancer**: slot bebas terendah (meja cadangan 1–4; slot ke-5 dst. tampil di kartu "+N"),
   nama dari daftar (Yoga, Dewi, Rudi, Maya, Eko, Nina, Fajar, …) dipilih dari hash id subagent — nama yang sedang
   dipakai freelancer lain dilewati.
4. Subagent yang dibangunkan lagi (mis. `SendMessage`) tetap dikerjakan karakter yang sama bila ia masih bebas.
5. Akhir job: jawaban akhir, `TaskStop`, limit, atau 15 menit tanpa aktivitas (dihitung dari aktivitas terakhir,
   supaya penugasan job lain tidak berubah surut).

Contoh: 6 subagent berjalan bersamaan → Budi, Sari, Agus, Rina di meja masing-masing + 2 freelancer (mis.
"Freelancer · Nina", "Freelancer · Fajar") masuk lewat pintu. Budi selesai → "Beres!", kembali ke lounge; subagent
berikutnya yang mulai ≥ 60 detik kemudian akan dikerjakan Budi lagi.

## Pengaturan opsional
Tidak ada file konfigurasi yang wajib. Untuk mengganti nama, judul, atau port, buat
`<project>/.claude/kantor-agent.json` (semua kunci opsional):
```json
{
  "title": "Toko Kue",
  "port": 8790,
  "names": {
    "ketua": "Pak Joko",
    "team": ["Bima", "Sari", "Ayu", "Rina"],
    "freelancers": ["Tono", "Wati", "Yoga"]
  },
  "autostart": false
}
```
| Kunci | Arti |
|---|---|
| `title` | Judul di bar atas (default: nama folder project). |
| `port` | Port awal (default `8788`; bila sibuk dipakai port bebas berikutnya). |
| `names.ketua` | Nama Ketua (default "Joko"). |
| `names.team` | 4 nama anggota tim (isi `null` untuk memakai bawaan di posisi itu). |
| `names.freelancers` | Daftar nama freelancer. |
| `autostart` | `true` = hook SessionStart plugin menyalakan server otomatis (lihat di bawah). |

Variabel lingkungan: `KANTOR_PORT`, `KANTOR_RUNTIME` (`node`/`php`), `KANTOR_BIND` (default `127.0.0.1`),
`KANTOR_STATE_DIR` (lokasi cache/log), `KANTOR_ALLOWED_HOSTS` (host tambahan di belakang reverse proxy),
`KANTOR_AUTOSTART=1`, `CLAUDE_CONFIG_DIR`. Perubahan nama/judul langsung terpakai (halaman memuat ulang sendiri).

## Mode menjalankan
| Cara | Perintah (dari folder project) |
|---|---|
| Node (bawaan) | `bash <runtime>/bin/kantor.sh start` |
| PHP | `bash <runtime>/bin/kantor.sh start --php` |
| Port lain | `bash <runtime>/bin/kantor.sh start --port 9000` |
| Status / hentikan | `bash <runtime>/bin/kantor.sh status` · `… stop` · `… restart` |
| Jaringan lokal (LAN) | `KANTOR_BIND=0.0.0.0 bash <runtime>/bin/kantor.sh restart` → `http://<ip-komputer>:8788/kerja` |
| Otomatis saat sesi mulai | `"autostart": true` di `.claude/kantor-agent.json` (plugin) |

`<runtime>` = `~/.claude/skills/kantor-agent/runtime` (pasang manual) atau folder plugin — skill mencetak path persisnya.
`start` idempoten: bila server sudah berjalan untuk project itu, hanya URL yang dicetak; setelah plugin diperbarui,
`start` otomatis memulai ulang server dengan versi baru. Setiap project mendapat servernya sendiri.

**Autostart (opsional, mati secara bawaan).** Plugin memasang hook `SessionStart` yang **tidak melakukan apa pun**
kecuali project mengaktifkannya (`"autostart": true`) atau `KANTOR_AUTOSTART=1` di-set. Hook itu senyap (tanpa output
ke sesi), selesai dalam milidetik, dan menjalankan server di latar belakang. Pemasangan manual tidak memasang hook;
bila ingin, tambahkan ke `.claude/settings.json` project:
```json
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command",
  "command": "KANTOR_AUTOSTART=1 bash ~/.claude/skills/kantor-agent/runtime/bin/kantor.sh autostart" } ] } ] } }
```

## URL publik (tunnel)
```text
/kantor-agent:kantor-agent publik        (atau: bash <runtime>/bin/kantor.sh tunnel)
```
Membuka quick tunnel cloudflared → `https://<acak>.trycloudflare.com/kerja` (tampil juga di halaman). Matikan dengan
`… tutup-publik` / `kantor.sh tunnel-stop`; `stop` juga mematikannya. URL berganti setiap kali tunnel dibuka ulang.

> ⚠️ **Keamanan: halaman ini tidak punya login.** Isinya read-only dan diredaksi, tetapi tetap memperlihatkan
> deskripsi tugas subagent, nama file, dan ringkasan aktivitas project. **Siapa pun yang tahu URL publik bisa
> membukanya.** Bagikan hanya ke orang yang kamu percaya dan matikan tunnel setelah selesai. Server bawaan hanya
> mendengarkan di `127.0.0.1`.

## Privasi
- **Yang tampil:** deskripsi tugas subagent & jenisnya, nama alat + path file relatif, deskripsi perintah Bash (bukan
  argumennya), baris pertama teks subagent, daftar `TodoWrite` sesi utama, jumlah aksi & token, waktu.
- **Yang tidak pernah dibaca/ditampilkan:** isi `tool_result` (output perintah, isi file), argumen perintah Bash,
  prompt lengkap ke subagent, teks jawaban sesi utama.
- **Redaksi otomatis** (Node & PHP identik): `password|sandi|secret|token|api_key = …`, `sk-…`, `ghp_…`, `xox?-…`,
  `AKIA…`, hex ≥ 40 karakter, alamat email, kredensial di URL → `•••`.
- Header `noindex`, `no-referrer`, CSP ketat, `X-Frame-Options: DENY`; hanya GET/HEAD; aset dibatasi whitelist;
  permintaan dengan Host asing ditolak (perlindungan DNS rebinding).
- Tidak ada font, analitik, atau sumber daya eksternal yang dimuat; tidak ada data yang dikirim ke mana pun
  (kecuali lewat tunnel yang kamu nyalakan sendiri).
- Obrolan receh karakter adalah teks tetap yang tidak pernah menyebut data nyata.

## Masalah umum / FAQ
**Semua karakter santai terus.** Kantor hanya bergerak bila ada aktivitas nyata. Pastikan server dijalankan dari
**folder yang sama** dengan tempat Claude Code dibuka (path harus identik — hindari membuka lewat symlink). Cek
`bash <runtime>/bin/kantor.sh status` → baris *Transkrip* menunjukkan folder yang dibaca dan jumlah sesinya.

**Subagent sudah dihentikan tapi karakter masih bekerja.** Subagent yang dihentikan lewat `TaskStop` langsung
terdeteksi. Bila prosesnya mati tanpa jejak (mis. Claude Code ditutup), karakter kembali santai setelah 15 menit
tanpa aktivitas.

**Port sudah dipakai.** Otomatis pindah ke port bebas berikutnya (sampai +20). Pilih sendiri: `--port 9000` atau
`"port"` di config.

**"Butuh Node ≥ 18 atau PHP ≥ 8.1".** Pasang salah satu (Node: https://nodejs.org). PHP butuh ekstensi `mbstring`.

**Layar kosong / 3D tidak tampil.** Browser butuh WebGL (panel tetap berjalan tanpa WebGL). Coba browser lain atau
aktifkan akselerasi grafis.

**Membuka dari ponsel.** Satu jaringan: `KANTOR_BIND=0.0.0.0 … restart` lalu buka `http://<ip-komputer>:8788/kerja`
(siapa pun di jaringan itu bisa membukanya). Beda jaringan: pakai [tunnel](#url-publik-tunnel).

**Di belakang reverse proxy / domain sendiri.** Teruskan seluruh prefiks `/kerja` ke `127.0.0.1:<port>` dan set
`KANTOR_ALLOWED_HOSTS=kantor.domainmu.com` (tanpa itu server menolak Host asing dengan 421). Pasang autentikasi di proxy.

**Karakter berjalan pelan / patah-patah.** Perangkat lambat merender dengan fps rendah; gerakan tetap sampai tujuan.
Aktifkan "Kurangi gerakan" (prefers-reduced-motion) di sistem untuk berpindah tanpa animasi.

**URL publik belum bisa dibuka.** Alamat `trycloudflare.com` yang baru butuh ±30 detik sampai dikenal DNS. Bila
browser sempat gagal lebih awal, ia bisa menyimpan kegagalan itu sebentar — tunggu lalu muat ulang (atau buka dari
perangkat lain).

**Windows.** Jalankan Claude Code dan Kantor Agent di WSL (butuh bash).

## Memperbarui
- **Plugin:** `claude plugin marketplace update kantor-agent` lalu `claude plugin update kantor-agent@kantor-agent`
  (atau `/plugin` → **Installed** → **Update now**), kemudian `/reload-plugins` dan jalankan skill lagi — server lama
  otomatis diganti versi baru.
- **Manual:** `git pull` di folder clone (symlink langsung ikut), lalu `kantor.sh restart`.

## Mencopot
1. Hentikan server di setiap project yang memakainya: `bash <runtime>/bin/kantor.sh stop`.
2. Plugin: `claude plugin uninstall kantor-agent@kantor-agent`, lalu `claude plugin marketplace remove kantor-agent`.
   Manual: `rm ~/.claude/skills/kantor-agent` (symlink) atau `rm -rf ~/.claude/skills/kantor-agent`.
3. Hapus cache & log: `rm -rf ~/.cache/kantor-agent`. Bila pernah membuat `.claude/kantor-agent.json`, hapus juga.

## Kontribusi
Issue dan pull request dipersilakan di [github.com/humaedihume/kantor-agent](https://github.com/humaedihume/kantor-agent).
- Logika server ada di **dua** runtime: ubah `lib/node/*.mjs` **dan** `lib/php/*.php`, lalu jalankan
  `node skills/kantor-agent/runtime/bin/parity.mjs --project=<project-uji>` (harus `PARITY OK`).
- Validasi plugin: `claude plugin validate --strict .`.
- Jangan pernah menyertakan transkrip, path, atau data project nyata di contoh/tangkapan layar.

## Lisensi
[MIT](LICENSE) © humaedihume. Komponen pihak ketiga yang disertakan (three.js r170 — MIT) tercantum di
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
