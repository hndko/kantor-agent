---
name: security-audit
description: Preset Audit Keamanan & Hardening Sistem Penuh. Otomatis mengorkestrasi Maya (Cybersecurity/OWASP Auditor), Agus (Memory Safety & Runtime Auditor), dan Budi (System Architect) untuk menyisir celah kerentanan OWASP Top 10, kebocoran memori native/RAM, secret leakage, dan penguatan arsitektur berlapis.
argument-hint: "<lingkup file atau modul yang ingin diaudit keamanannya>"
---

# 🛡️ Full Security & Hardening Audit Preset

Saat skill ini aktif via `/security-audit <perintah>`, **Joko (Sesi Utama)** otomatis menggerakkan satuan tugas keamanan:

```text
                        ┌───────────────────────────────┐
                        │    JOKO (Lead Orchestrator)   │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
     ┌───────────────────────┐                       ┌──────────────────────┐
     │      MAYA (Meja B3)   │                       │     AGUS (Meja A3)   │
     │  Cybersecurity Lead   │                       │ Memory Safety Auditor│
     └──────────┬────────────┘                       └──────────────────────┘
                │
                ▼
     ┌───────────────────────┐
     │      BUDI (Meja A1)   │
     │ Architecture Hardening│
     └───────────────────────┘
```

---

## 👥 Alur Kerja Otomatis Satuan Tugas Keamanan

1. **Langkah 1 — Penyisiran Kerentanan OWASP & Secrets (Maya)**:
   - Joko memanggil **Maya** (`invoke_subagent` dengan Role: `"Cybersecurity Auditor"`).
   - Maya memeriksa raw query (SQL Injection), escaping output HTML/Blade/Vue (XSS), verifikasi CSRF token, pemeriksaan otorisasi IDOR di setiap endpoint, dan scanning agar tidak ada credential/API key yang bocor di Git.
2. **Langkah 2 — Audit Runtime, Exception & Memori (Agus)**:
   - Joko memanggil **Agus** (`invoke_subagent` dengan Role: `"Memory & Performance Auditor"`).
   - Agus memeriksa penanganan resource unmanaged (`IDisposable`, stream files, DB connections), unhandled exception logging, dan pencegahan Denial of Service (DoS) akibat memory leak atau infinite loop.
3. **Langkah 3 — Rekomendasi Arsitektur Defense-in-Depth (Budi)**:
   - Joko memanggil **Budi** (`invoke_subagent` dengan Role: `"System & Domain Architect"`).
   - Budi merumuskan arsitektur pertahanan berlapis (Least Privilege RBAC, Service Layer validation, Fail-safe defaults).
4. **Langkah 4 — Laporan Rekomendasi & Mitigasi (Joko)**:
   - Joko menyusun laporan audit berstandar industri dengan klasifikasi tingkat keparahan (Critical, High, Medium, Low) beserta solusi drop-in patch.
