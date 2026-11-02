---
name: aoi-team
description: Preset Multi-Agent AOI Enterprise. Mengorkestrasi 4 subagent senior secara otomatis (Vision Architect, WPF/MVVM Specialist, Memory & Safety Auditor, Test QA) untuk membagi dan menyelesaikan tugas kompleks dengan zero-blocking UI dan memory safety.
argument-hint: "<deskripsi fitur atau refactoring yang ingin dikerjakan>"
---

# 👥 AOI Multi-Agent Orchestration Preset

Saat skill ini aktif, **Joko (Sesi Utama)** bertindak sebagai **Team Lead & Orchestrator**. 
Joko **TIDAK** mengerjakan seluruh proses teknis sendirian, melainkan **wajib membagi tugas ke 4 peran subagent senior** menggunakan alat `invoke_subagent`.

---

## 🎭 4 Peran Subagent Senior

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        JOKO (Lead Orchestrator)                        │
└────────────────┬───────────────────┬───────────────────┬───────────────┘
                 │                   │                   │
                 ▼                   ▼                   ▼
┌─────────────────────────┐ ┌───────────────────┐ ┌──────────────────────┐
│       BUDI (Tim 1)      │ │   SARI (Tim 2)    │ │    AGUS (Tim 3)      │
│ Vision/Domain Architect │ │ WPF/MVVM Specialist│ │Memory & Safety Audit│
└─────────────────────────┘ └───────────────────┘ └──────────────────────┘
                                     │
                                     ▼
                            ┌───────────────────┐
                            │   RINA (Tim 4)    │
                            │  Test & QA Lead   │
                            └───────────────────┘
```

1. **Budi — Vision & Domain Architect** (Subagent `research`):
   - **Tugas**: Menyelidiki file domain, membaca struktur ViewModel terkait (`InspectionViewModel`, `TeachingViewModel`, dsb), dan memetakan kontrak API/model data.
   - **Fokus**: Menjamin konsistensi alur inspeksi dan ketersediaan interface.

2. **Sari — WPF & MVVM Specialist** (Subagent `self`):
   - **Tugas**: Mengimplementasikan logic ViewModel dengan `CommunityToolkit.Mvvm`, membuat RelayCommand, binding XAML, dan mengatur asynchronous execution agar UI tidak freeze.
   - **Fokus**: Zero-blocking UI thread, responsive visual feedback, and clean binding.

3. **Agus — Memory & Safety Auditor** (Subagent `research`):
   - **Tugas**: Memeriksa kode yang dibuat untuk memastikan tidak ada kebocoran unmanaged memory (`OpenCvSharp.Mat`), memastikan semua resource di-`Dispose()` dengan benar, serta memverifikasi thread safety pada panggilan Dispatcher.
   - **Fokus**: Kepatuhan terhadap 10 Pilar `AGENTS.md`.

4. **Rina — Test & QA Engineer** (Subagent `self`):
   - **Tugas**: Menulis unit test xUnit di `src/MariPartner.VisionInspector.Tests`, menjalankan pengujian otomatis (`dotnet test MariPartner.VisionInspector.sln --nologo`), dan memastikan semua test hijau tanpa regresi.
   - **Fokus**: Verifikasi fungsionalitas dan Definition of Done.

---

## 📋 Prosedur Eksekusi Joko (Sesi Utama)

Ketika user menjalankan `/aoi-team <permintaan>`:

1. **Langkah 1 (Breakdown & Delegasi Awal)**:
   - Panggil subagent **Budi** (`invoke_subagent` dengan Role: `"Vision & Domain Architect"`) untuk riset codebase dan mengumpulkan konteks teknis.
2. **Langkah 2 (Implementasi)**:
   - Panggil subagent **Sari** (`invoke_subagent` dengan Role: `"WPF & MVVM Specialist"`) untuk menulis kode/komponen sesuai hasil riset.
3. **Langkah 3 (Audit Keamanan & Memori)**:
   - Panggil subagent **Agus** (`invoke_subagent` dengan Role: `"Memory & Safety Auditor"`) untuk mereview kode terhadap `Mat.Dispose()` dan UI thread blocking.
4. **Langkah 4 (Pengujian Mutu)**:
   - Panggil subagent **Rina** (`invoke_subagent` dengan Role: `"Test & QA Engineer"`) untuk membuat test dan menjalankan `dotnet test`.
5. **Langkah 5 (Laporan Akhir)**:
   - Joko mengonsolidasikan seluruh hasil kerja tim dan memberikan laporan ringkas serta status verifikasi kepada user.
