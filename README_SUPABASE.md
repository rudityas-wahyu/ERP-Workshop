Halo! Jika Anda tidak melihat kunci yang berawalan `eyJ`, kemungkinan besar Anda melihat di menu yang salah (misalnya di bagian *Database Password* atau *Connection String*).

**Kunci `anon` `public` SELALU diawali dengan `eyJ` karena itu adalah format token JWT standar.**

Mari kita cari kuncinya bersama:
1. Buka halaman project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Di menu navigasi sebelah **kiri paling bawah**, klik ikon roda gigi ⚙️ (**Project Settings**).
3. Di dalam menu Settings tersebut, klik **API** (berada di bawah bagian *Configuration*).
4. Di bagian atas halaman API, Anda akan melihat bagian **Project API keys**.
5. Di situ terdapat baris berlabel **`anon`** dan **`public`**.
6. Klik tombol **Copy** 📋 di sebelahnya. (Kuncinya disensor dengan titik-titik, tapi saat dicopy akan berupa teks sangat panjang yang diawali dengan `eyJ`).

Kembali ke aplikasi ini:
1. Klik ikon roda gigi ⚙️ di pojok kanan atas aplikasi.
2. Paste kunci tersebut ke kolom `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Klik **Save & Reload**.

*Catatan: Jangan gunakan kunci `service_role` (yang biasanya berawalan `sb_secret...` pada versi CLI/lokal) karena browser akan otomatis memblokirnya demi keamanan.*
