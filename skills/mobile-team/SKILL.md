---
name: mobile-team
description: Preset Spesialis Mobile & Modern Android. Otomatis mengorkestrasi Rudi (Mobile Systems Architect), Dewi (API/Data Serialization Specialist), dan Rina (Mobile QA & Testing) untuk membangun fitur Android modern (Jetpack Compose, Kotlin Flow, Room DB, WorkManager) bebas memory leak dan render 60/120 FPS.
argument-hint: "<fitur aplikasi mobile, layar compose, atau integrasi data android>"
---

# 📱 Modern Android & Mobile Engineering Preset

Saat skill ini aktif via `/mobile-team <perintah>`, **Joko (Sesi Utama)** otomatis menggerakkan divisi Mobile:

```text
                        ┌───────────────────────────────┐
                        │    JOKO (Lead Orchestrator)   │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
     ┌───────────────────────┐                       ┌──────────────────────┐
     │      RUDI (Meja B2)   │                       │     DEWI (Meja B1)   │
     │   Mobile Architect    │                       │  API & Serialization │
     └──────────┬────────────┘                       └──────────────────────┘
                │
                ▼
     ┌───────────────────────┐
     │      RINA (Meja A4)   │
     │  Mobile Unit Testing  │
     └───────────────────────┘
```

---

## 👥 Alur Kerja Otomatis Divisi Mobile

1. **Langkah 1 — Sinkronisasi Kontrak & DTO Jaringan (Dewi)**:
   - Joko memanggil **Dewi** (`invoke_subagent` dengan Role: `"API & Integration Architect"`).
   - Dewi memetakan payload API ke model DTO Kotlinx Serialization yang ramah mobile, dengan penanganan field nullable yang aman.
2. **Langkah 2 — Implementasi Compose UI & State Management (Rudi)**:
   - Joko memanggil **Rudi** (`invoke_subagent` dengan Role: `"Mobile Systems Architect"`).
   - Rudi merancang deklaratif UI (Jetpack Compose), mengikat state dengan `StateFlow` dan `collectAsStateWithLifecycle()`, serta memastikan persistensi offline-first Room DB dan background job WorkManager.
3. **Langkah 3 — Pengujian ViewModel & Edge-Case (Rina)**:
   - Joko memanggil **Rina** (`invoke_subagent` dengan Role: `"QA & Test Lead"`).
   - Rina menjalankan unit test StateFlow (Turbine/Coroutines Test) untuk memastikan state loading, success, dan error teruji dengan benar.
4. **Langkah 4 — Laporan Konsolidasi (Joko)**:
   - Joko mengonsolidasikan arsitektur Composable, verifikasi FPS, dan ringkasan pengujian.
