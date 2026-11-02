---
name: db-team
description: Preset Spesialis Database & Caching. Otomatis mengorkestrasi Yoga (Database Architect), Agus (Performance/Memory Auditor), dan Rina (QA/Data Verification) untuk optimasi query, perancangan skema, indexing tingkat lanjut, SQLite WAL tuning, dan caching Redis.
argument-hint: "<masalah database, optimasi query, atau rancangan skema tabel>"
---

# 🗄️ Database & Performance Optimization Preset

Saat skill ini aktif via `/db-team <perintah>`, **Joko (Sesi Utama)** otomatis menggerakkan divisi data:

```text
                        ┌───────────────────────────────┐
                        │    JOKO (Lead Orchestrator)   │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
     ┌───────────────────────┐                       ┌──────────────────────┐
     │      YOGA (Meja B0)   │                       │     AGUS (Meja A3)   │
     │   Database Architect  │                       │ Performance & Memory │
     └──────────┬────────────┘                       └──────────────────────┘
                │
                ▼
     ┌───────────────────────┐
     │      RINA (Meja A4)   │
     │   QA & Data Integrity │
     └───────────────────────┘
```

---

## 👥 Alur Kerja Otomatis Tim Database

1. **Langkah 1 — Analisis Skema & Indexing (Yoga)**:
   - Joko memanggil **Yoga** (`invoke_subagent` dengan Role: `"Database & Cache Architect"`).
   - Yoga memeriksa query plan (`EXPLAIN`), composite index, tipe data kolom, isolasi transaksi, dan konfigurasi engine (SQLite WAL mode / MySQL InnoDB).
2. **Langkah 2 — Audit Resource & Beban Memori (Agus)**:
   - Joko memanggil **Agus** (`invoke_subagent` dengan Role: `"Memory & Performance Auditor"`).
   - Agus memastikan batch query tidak menahan memori RAM secara berlebihan, tidak ada query N+1, dan garbage collection / memory release berjalan optimal.
3. **Langkah 3 — Verifikasi Integritas Data (Rina)**:
   - Joko memanggil **Rina** (`invoke_subagent` dengan Role: `"QA & Test Lead"`).
   - Rina menjalankan test suite verifikasi, memastikan migrasi aman (*zero data loss*), dan validasi rollback.
4. **Langkah 4 — Laporan Konsolidasi (Joko)**:
   - Joko merangkum indeks baru, perubahan skema, dan peningkatan kecepatan query untuk user.
