Halo!

Ah, saya mengerti. Jika di dashboard Anda tertulis **Publishable key**, itu adalah kunci yang benar! Supabase (atau layanan database serupa) sering kali menyebut kunci publik ini sebagai **Publishable key**.

**Publishable key** aman untuk digunakan di frontend/browser.

Silakan masukkan **Publishable key** tersebut ke dalam pengaturan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di aplikasi ini dengan cara:
1. Buka menu **Settings** (ikon roda gigi ⚙️ di pojok).
2. Masukkan URL Supabase Anda di `NEXT_PUBLIC_SUPABASE_URL`.
3. Masukkan **Publishable key** Anda ke dalam kotak `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Simpan.

Jika masih ada error, pastikan tidak ada spasi tambahan (spasi kosong) di awal atau di akhir saat Anda mem-paste (menyalin) kuncinya.
