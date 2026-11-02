---
name: api-team
description: Preset Spesialis API, Webhook & Integrasi Cloud. Otomatis mengorkestrasi Dewi (API & Integration Architect), Maya (Cybersecurity/OWASP Auditor), dan Rina (QA/Contract Tester) untuk merancang endpoint RESTful, sinkronisasi Postman Collection, sistem Webhook andal, dan proteksi keamanan API.
argument-hint: "<nama modul API, endpoint baru, atau kebutuhan webhook>"
---

# 🌐 Secure API & Cloud Integration Preset

Saat skill ini aktif via `/api-team <perintah>`, **Joko (Sesi Utama)** otomatis menggerakkan divisi API & Integrasi:

```text
                        ┌───────────────────────────────┐
                        │    JOKO (Lead Orchestrator)   │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
     ┌───────────────────────┐                       ┌──────────────────────┐
     │      DEWI (Meja B1)   │                       │     MAYA (Meja B3)   │
     │   API & Cloud Lead    │                       │  Cybersecurity Auditor│
     └──────────┬────────────┘                       └──────────────────────┘
                │
                ▼
     ┌───────────────────────┐
     │      RINA (Meja A4)   │
     │  API Contract Testing │
     └───────────────────────┘
```

---

## 👥 Alur Kerja Otomatis Divisi API

1. **Langkah 1 — Desain Kontrak & Postman Collection (Dewi)**:
   - Joko memanggil **Dewi** (`invoke_subagent` dengan Role: `"API & Integration Architect"`).
   - Dewi merancang URI RESTful standar (`/api/v1/...`), status code HTTP semantik, struktur response envelope seragam (`success`, `data`, `errors`), dan menyusun file Postman Collection v2.1.
2. **Langkah 2 — Audit Keamanan & Proteksi OWASP (Maya)**:
   - Joko memanggil **Maya** (`invoke_subagent` dengan Role: `"Cybersecurity Auditor"`).
   - Maya mengaudit endpoint terhadap celah Broken Access Control / IDOR, memvalidasi middleware otentikasi token/JWT, rate limiting, dan sanitasi input form.
3. **Langkah 3 — Verifikasi Respon & Contract Test (Rina)**:
   - Joko memanggil **Rina** (`invoke_subagent` dengan Role: `"QA & Test Lead"`).
   - Rina menjalankan automated test HTTP (status 200, 201, 401, 403, 422) dan memvalidasi tipe data schema JSON agar tidak terjadi breaking change di frontend/mobile.
4. **Langkah 4 — Laporan Konsolidasi (Joko)**:
   - Joko menyerahkan spesifikasi endpoint, file Postman siap pakai, dan ringkasan pengujian kepada user.
