// ============================================================
// data.js — Default system prompt & campus memory data
// ============================================================

/**
 * System prompt default untuk chatbot FAQ kampus.
 * Dapat diedit oleh pengguna melalui panel konfigurasi.
 */

const DEFAULT_SYSTEM_PROMPT = `You are the official virtual FAQ assistant for Ling Tung University (嶺東科技大學 / LTU). Your mission is to help students, prospective students, and the campus community get accurate information about the university.

== LANGUAGE DETECTION & RESPONSE RULES (MANDATORY) ==
You MUST detect the language of the user's input and reply in the EXACT same language.
Supported languages and their rules:
- Indonesian (Bahasa Indonesia): If user writes in Indonesian → reply fully in Indonesian.
- English: If user writes in English → reply fully in English.
- Traditional Chinese (繁體中文): If user writes in Chinese characters → reply fully in Traditional Chinese (台灣繁體中文).
- Vietnamese (Tiếng Việt): If user writes in Vietnamese → reply fully in Vietnamese.
- Thai (ภาษาไทย): If user writes in Thai script → reply fully in Thai.
IMPORTANT: NEVER mix languages in a single reply. If a user writes in Thai, your ENTIRE response must be in Thai. If in Vietnamese, your ENTIRE response must be in Vietnamese. No exceptions.
If unsure of the language, default to English.

== SCOPE RULES ==
- ONLY answer questions related to the university (admissions, academics, scholarships, facilities, contacts, fees, etc.).
- If a question is off-topic, politely decline in the user's language and redirect to campus topics.
- Prioritize information from the campus memory data (DATA_KAMPUS) provided.
- If information is not available in memory, honestly say so and direct the user to the relevant office.
- NEVER fabricate information.

== RESPONSE FORMAT ==
- Be concise and direct. Use bullet points for multiple items.
- Include relevant contact/unit at the end when applicable.
- For procedures/steps, use numbered lists.
- Use a polite, professional tone appropriate to the detected language.

== KEY CAMPUS INFO ==
- University: 嶺東科技大學 (Ling Tung University / LTU)
- Rector: 陳仁龍
- Motto: 學以致用，誠以待人
- Founded: 1964 (junior high), became university 2005
- Location: 1 Ling Tung Rd., Nantun, Taichung 408, Taiwan
- Colleges: 商學院 (Business), 設計學院 (Design), 資訊科學學院 (Info Science), 時裝學院 (Fashion)
- Mascot: Lucky Goat | Students: ~11,000 undergrad | Staff: ~500 academic
- Accreditation: Ministry of Education Taiwan + ACBSP`;

/**
 * Memory kampus default dalam format JSON.
 * Berisi informasi lengkap tentang kampus yang akan dijadikan referensi chatbot.
 */
const DEFAULT_CAMPUS_MEMORY = {
  kampus: {
    nama: "嶺東科技大學",
    singkatan: "LTU",
    tagline: "學以致用，誠以待人",
    tahun_berdiri: 2005,
    status: "Terakreditasi A+ oleh Kementerian Pendidikan Taiwan",
    lokasi: {
      alamat: "1, Ling tung Rd.",
      kota: "Taichung",
      distrik: "Nantun",
      kode_pos: "408",
      koordinat: "24.1378° N, 120.6086° E",
    },
    website: "www.ltu.edu.tw",
    telepon: "886-4-23892088",
    fax: "886-4-36015202",
    email_umum: "ltu1211@teamail.ltu.edu.tw",
  },

  pendaftaran: {
    jalur: [
      {
        nama: "Jalur Prestasi",
        deskripsi: "Tanpa tes, berdasarkan nilai rapor dan prestasi",
        periode: "Januari - Maret",
        kuota: "30% dari total kursi",
      },
      {
        nama: "Jalur Reguler",
        deskripsi: "Melalui tes tertulis dan wawancara",
        periode: "April - Juli",
        kuota: "60% dari total kursi",
      },
      {
        nama: "Jalur Transfer",
        deskripsi: "Khusus mahasiswa pindahan dari perguruan tinggi lain",
        periode: "Februari - Agustus",
        kuota: "10% dari total kursi",
      },
    ],
    syarat_umum: [
      "Ijazah SMA/SMK/MA (atau surat keterangan lulus)",
      "Raport semester 1-5 (nilai rata-rata minimal 7.0)",
      "Foto berwarna terbaru 3x4 (2 lembar)",
      "Fotokopi KTP yang masih berlaku",
      "Fotokopi Kartu Keluarga",
      "Surat keterangan sehat dari dokter",
    ],
    biaya_pendaftaran: {
      jalur_prestasi: "Rp 150.000",
      jalur_reguler: "Rp 200.000",
      jalur_transfer: "Rp 250.000",
    },
    cara_daftar: [
      "Kunjungi halaman pendaftaran resmi Ling Tung University untuk informasi terbaru.",
      "Siapkan dokumen akademik dan bukti dukungan finansial.",
      "Ikuti petunjuk pendaftaran internasional yang disediakan di situs Admissions.",
    ],
    kontak_pmb: {
      unit: "Panitia Penerimaan Mahasiswa Baru (PMB)",
      telepon: "886-4-23892088",
      faksimile: "886-4-36015202",
      email: "ltu1211@teamail.ltu.edu.tw",
      jam_layanan: "Senin-Jumat: 08.00-17.00",
    },
  },

  international_applicants: {
    biaya_tahunan: {
      tuition_and_fees: "US $ 2700/Year",
      housing_and_living: "US $ 670/Year",
      health_insurance: "US $ 10/Year",
      total: "US $ 3380 USD/Year",
    },
    kontak: {
      kantor: "International Affairs Center",
      kantor_tambahan: ["Office of Academic Affairs", "Student Affairs Office"],
      telepon: "886-4-23892088",
    },
    beasiswa_total: "NT$30,000,000 per year",
    beasiswa: [
      {
        nama: "Excellent Student Scholarship in Entrance Examination",
        deskripsi:
          "Diberikan kepada mahasiswa baru LTU dengan prestasi akademik sangat baik dalam ujian masuk.",
      },
      {
        nama: "Excellent Foreign Students Scholarship",
        deskripsi:
          "Beasiswa khusus untuk mahasiswa internasional dengan prestasi akademik yang sangat baik; biaya kuliah bisa terpotong penuh.",
      },
    ],
    syarat: [
      "Untuk program sarjana: lulusan SMA/SMK/MA.",
      "Untuk program pascasarjana: lulusan perguruan tinggi dengan gelar B.A.",
      "Memiliki kemampuan Mandarin yang memadai.",
      "Menyediakan surat keterangan dukungan finansial.",
    ],
  },

  fee_info: {
    tuition_and_miscellaneous_fees: "US $ 2700/yr ~ US $ 3000/yr",
    on_campus_accommodation: "US $ 670/yr ~ US $ 700/yr",
    remark:
      "For detailed information, please contact General Affairs Office - Cashier Division: 886-4-23892088 ext.1841",
  },

  international_admission: {
    deskripsi:
      "International admission tersedia untuk program sarjana, magister, dan doktoral di beberapa jurusan terpilih.",
    jurusan: [
      "Information Management (B.B.A.)",
      "Information Technology (B.S.)",
      "Visual Communication Design (B.Des.)",
      "Business Administration (B.B.A.)",
      "Digital Content Design (B.Des.)",
      "Fashion Design (B.Des.)",
      "Marketing and Logistics Management (B.B.A.)",
      "Creative Product Design (B.Des.)",
      "Tourism and Leisure Management (B.B.A.)",
      "International Business (B.B.A.)",
      "Applied Foreign Languages (B.B.A.)",
      "Finance (B.B.A.)",
      "Accounting and Information Technology (B.B.A.)",
    ],
  },

  fakultas_dan_prodi: [
    {
      fakultas: "Business and Management",
      akreditasi: "A",
      prodi: [
        {
          nama: "Executive Master of Business Administration",
          jenjang: "S2",
          akreditasi: "A",
          gelar: "EMBA",
          konsentrasi: [
            "Kecerdasan Buatan",
            "Jaringan Komputer",
            "Rekayasa Perangkat Lunak",
          ],
        },
        {
          nama: "Graduate Institute of Business Administration",
          jenjang: "S2",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Struktur", "Transportasi", "Manajemen Konstruksi"],
        },
        {
          nama: "Graduate Institute of Marketing and Logistics Management",
          jenjang: "S2",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Graduate Institute of International Business",
          jenjang: "S2",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Graduate Institute of Tourism and Leisure Management",
          jenjang: "S2",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Business Administration",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Marketing and Logistics Management",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Tourism and Leisure Management",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of International Business",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Applied Foreign Languages",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Graduate Institute of Finance",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "M.B.A",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Graduate Institute of Accounting and Information Technology",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Graduate Institute of Financial and Economic Law",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "LL.M",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Finance",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "M.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
        {
          nama: "Department of Accounting and Information Technology",
          jenjang: "S1",
          akreditasi: "B",
          gelar: "B.B.A.",
          konsentrasi: ["Elektronika", "Tenaga Listrik", "Telekomunikasi"],
        },
      ],
    },
    {
      fakultas: "Fashion",
      akreditasi: "A",
      prodi: [
        {
          nama: "Graduate Institute of Fashion Stylist Design",
          jenjang: "S2",
          akreditasi: "A",
          gelar: "M.Des.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
        {
          nama: "Department of Fashion Business and Merchandising",
          jenjang: "S1",
          akreditasi: "A",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
        {
          nama: "Department of Fashion and Accessories Design",
          jenjang: "S1",
          akreditasi: "A",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
        {
          nama: "Department of Fashion Stylist Design",
          jenjang: "S1",
          akreditasi: "A",
          gelar: "B.Des.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
      ],
    },
    {
      fakultas: "Design",
      akreditasi: "A",
      prodi: [
        {
          nama: "Graduate Institute of Digital Content Design",
          jenjang: "S2",
          akreditasi: "A",
          gelar: "M.Des.",
          konsentrasi: ["E-Business", "Sistem Enterprise", "Data Analytics"],
        },
        {
          nama: "Graduate Institute of Visual Communication Design",
          jenjang: "S2",
          akreditasi: "A",
          gelar: "M.Des.",
          konsentrasi: ["Komputasi", "Data Science", "Keamanan Siber"],
        },
        {
          nama: "Graduate Institute of Creative Product Design",
          jenjang: "S1",
          akreditasi: "B",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
        {
          nama: "Department of Visual Communication Design",
          jenjang: "S1",
          akreditasi: "A",
          gelar: "B.Des.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
        {
          nama: "Department of Digital Content Design",
          jenjang: "S1",
          akreditasi: "A",
          gelar: "B.Des.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
        {
          nama: "Department of Creative Product Design",
          jenjang: "S1",
          akreditasi: "B",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
      ],
    },
    {
      fakultas: "Information Science",
      akreditasi: "A",
      prodi: [
        {
          nama: "Graduate Institute of Applied Information Technology",
          jenjang: "S2",
          akreditasi: "A",
          gelar: "M.S.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
        {
          nama: "Graduate Institute of Information Management and Applications",
          jenjang: "S1",
          akreditasi: "A",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
        {
          nama: "Department of Information Technology",
          jenjang: "S1",
          akreditasi: "A",
          gelar: "B.S.",
          konsentrasi: ["Akuntansi Keuangan", "Perpajakan", "Audit"],
        },
        {
          nama: "Department of Information Management",
          jenjang: "S1",
          akreditasi: "A",
          gelar: "B.B.A.",
          konsentrasi: ["Pemasaran", "Keuangan", "SDM", "Operasional"],
        },
      ],
    },
  ],

  biaya_pendidikan: {
    catatan:
      "Biaya dapat berubah setiap tahun akademik. Konfirmasi ke Bagian Keuangan untuk informasi terbaru.",
    ukt_per_semester: {
      golongan_1: "Rp 500.000 (penghasilan orang tua < Rp 500.000/bulan)",
      golongan_2:
        "Rp 1.000.000 (penghasilan orang tua Rp 500.000 - 1 juta/bulan)",
      golongan_3: "Rp 3.500.000 (penghasilan orang tua Rp 1 - 2 juta/bulan)",
      golongan_4: "Rp 5.000.000 (penghasilan orang tua Rp 2 - 4 juta/bulan)",
      golongan_5: "Rp 7.500.000 (penghasilan orang tua > Rp 4 juta/bulan)",
    },
    biaya_lain: {
      praktikum: "Rp 500.000 - 1.500.000/semester (tergantung prodi)",
      wisuda: "Rp 1.500.000",
      skripsi_bimbingan: "Sudah termasuk UKT",
      her_registrasi: "Gratis jika bayar UKT tepat waktu",
    },
    metode_pembayaran: [
      "Transfer BNI (virtual account)",
      "Transfer BRI (virtual account)",
      "Mandiri (virtual account)",
      "Indomaret / Alfamart",
    ],
    kontak_keuangan: {
      unit: "Bagian Keuangan",
      telepon: "(022) 123-4568",
      email: "keuangan@utn.ac.id",
      lokasi: "Gedung Rektorat, Lantai 1",
      jam_layanan: "Senin-Jumat: 08.00-15.00 WIB",
    },
  },

  beasiswa: [
    {
      nama: "Excellent Student Scholarship in Entrance Examination",
      penyelenggara: "Ling Tung University",
      cakupan:
        "Beasiswa untuk mahasiswa baru dengan prestasi akademik unggul dalam ujian masuk.",
      syarat: ["Prestasi akademik sangat baik dalam ujian masuk"],
      deskripsi:
        "Diberikan kepada mahasiswa baru LTU yang menunjukkan nilai ujian masuk terbaik.",
    },
    {
      nama: "Excellent Foreign Students Scholarship",
      penyelenggara: "Ling Tung University",
      cakupan:
        "Potongan penuh biaya kuliah untuk mahasiswa internasional berprestasi.",
      syarat: ["Mahasiswa asing dengan catatan akademik sangat baik"],
      deskripsi:
        "Beasiswa khusus untuk mahasiswa internasional yang memenuhi standar akademik tinggi.",
    },
    {
      nama: "Beasiswa KIP Kuliah",
      penyelenggara: "Pemerintah (Kemendikbudristek)",
      cakupan: "Biaya kuliah penuh + biaya hidup bulanan",
      syarat: [
        "WNI",
        "Lulus SMA/SMK/MA",
        "Memiliki NISN dan terdaftar di DTKS atau memiliki KKS/PKH/KIP",
        "Lolos seleksi KIP Kuliah",
      ],
      pendaftaran: "Melalui website kip-kuliah.kemdikbud.go.id",
      periode: "Bersamaan dengan pendaftaran masuk kampus",
    },
    {
      nama: "Beasiswa Prestasi Akademik",
      penyelenggara: "UTN",
      cakupan: "Potongan UKT 50-100%",
      syarat: [
        "IPK minimal 3.50",
        "Aktif berkuliah minimal 2 semester",
        "Tidak sedang menerima beasiswa lain",
        "Surat rekomendasi dari dosen wali",
      ],
      pendaftaran: "Setiap awal semester, melalui portal mahasiswa",
    },
    {
      nama: "Beasiswa Perusahaan Mitra",
      penyelenggara: "Perusahaan Mitra UTN",
      cakupan: "Bervariasi per perusahaan",
      syarat: "Lihat pengumuman di papan info kampus atau portal mahasiswa",
      info_lebih_lanjut: "Hubungi Bagian Kemahasiswaan",
    },
    {
      nama: "Beasiswa Afirmasi Daerah",
      penyelenggara: "Pemerintah Daerah",
      cakupan: "Biaya kuliah penuh",
      syarat: [
        "Berasal dari daerah 3T (Terdepan, Terluar, Tertinggal)",
        "Rekomendasi dari pemerintah daerah asal",
      ],
      pendaftaran: "Melalui pemerintah daerah masing-masing",
    },
  ],

  layanan_akademik: {
    krs: {
      nama_lengkap: "Kartu Rencana Studi",
      cara_pengisian: [
        "Login ke portal akademik di portal.utn.ac.id",
        "Masukkan NIM dan password",
        "Pilih menu 'KRS Online'",
        "Pilih mata kuliah yang tersedia sesuai semester",
        "Perhatikan batas SKS per semester (maks 24 SKS untuk IPK ≥ 3.0, maks 21 SKS untuk IPK 2.5-2.99)",
        "Simpan dan cetak KRS",
        "Minta tanda tangan persetujuan dari Dosen Wali",
      ],
      periode: "2 minggu pertama setiap semester (lihat kalender akademik)",
      batas_sks: {
        ipk_atas_3: "Maksimal 24 SKS",
        ipk_2_5_sampai_3: "Maksimal 21 SKS",
        ipk_bawah_2_5: "Maksimal 18 SKS",
      },
    },
    transkip_nilai: {
      cara_mengurus: "Melalui portal akademik atau datang ke BAAK",
      estimasi_waktu: "1-3 hari kerja",
      biaya: "Gratis (pertama kali), Rp 10.000 untuk penggandaan",
    },
    surat_keterangan: {
      jenis: [
        "Surat Keterangan Aktif Kuliah",
        "Surat Keterangan Lulus",
        "Surat Keterangan IPK",
      ],
      cara_mengurus: "Datang ke BAAK dengan menunjukkan KTM aktif",
      estimasi_waktu: "1-2 hari kerja",
    },
    kontak_baak: {
      unit: "Biro Administrasi Akademik dan Kemahasiswaan (BAAK)",
      telepon: "(022) 123-4569",
      email: "baak@utn.ac.id",
      lokasi: "Gedung Rektorat, Lantai 2",
      jam_layanan: "Senin-Jumat: 08.00-16.00 WIB",
    },
  },

  office_of_academic_affairs: {
    nama: "Office of Academic Affairs",
    deskripsi:
      "The office deals with academic affairs consisting of three divisions of Curriculum, Registrar's Office and Curriculum Development Center. The staff members in this office include a Dean of Academic Affairs, a secretary, two directors and several clerks in each division. Based on the school's policy concerning academic affairs, the Dean makes a blueprint for the overall administrative work, which is executed by related divisions.",
    telepon: "886-4-23892088 ext.1601-1602",
    faksimile: "886-4-23895293",
    email: "ltu1600@teamail.ltu.edu.tw",
    situs_web: {
      english: "http://www.ltu.edu.tw/~aao/eng/e1_top.html",
      chinese: "http://www.ltu.edu.tw/~aao/",
    },
    lokasi: "Taichung, Taiwan, R.O.C.",
  },

  administrative_offices: [
    "Continuing Education Office",
    "General Affairs Office",
    "International Affairs Center",
    "Library",
    "Office of Academic Affairs",
    "Office of President",
    "Office of Vice-President",
    "Secretariat",
    "Student Affairs Office",
  ],

  academic_projects: [
    "3D Animation Classroom",
    "Center for Educational Multimedia Resources",
    "Center for Multimedia Networking and Post Production",
    "Class for Modern Technology and Information Networking",
    "Computer Game Industry-Academic Collaboration Center",
    "Digital Art Gallery",
    "Digital Audio Lab",
    "Digital Power Creativity Studio",
    "Linear Editing Room",
    "Non-linear Editing Room",
    "Puppet Animation Lab",
    "Video Networking and Post Production Classroom",
    "Virtual Film Studio",
    "Virtual Reality Gallery",
  ],

  sister_schools: [
    "University of Nevada, Reno, U.S.A.",
    "The University of Tennessee at Martin, U.S.A.",
    "Thomas More College, U.S.A.",
    "University of Santo Tomas, Philippines",
    "Singapore Management University",
    "Bond University, Australia",
    "Sapporo University, Japan",
    "Kookmin University, Korea",
    "Vietnam National University, Hanoi",
    "National Economics University, Vietnam",
    "P'azmary P'eter Catholic University Budapest, Hungary",
    "Apor Vilmos Catholic College, Hungary",
    "Hungarian University of Craft and Design, Hungary",
    "Soochow University, P.R.O.C.",
    "Shanghai Second Polytechnic University, P.R.O.C.",
    "Guangdong Lingnan Institute of Technology, P.R.O.C.",
  ],

  fasilitas: {
    akademik: [
      "Perpustakaan digital dan fisik (koleksi > 50.000 judul)",
      "Laboratorium komputer (200+ unit PC)",
      "Laboratorium bahasa",
      "Laboratorium teknik (sipil, elektro, mekanik)",
      "Ruang kelas ber-AC dengan proyektor",
      "Akses jurnal internasional (Scopus, IEEE, Elsevier)",
      "Studio rekaman dan multimedia",
    ],
    penunjang: [
      "Wifi kampus gratis (1 Gbps backbone)",
      "Kantin mahasiswa (7 unit)",
      "Masjid kampus (kapasitas 500 orang)",
      "Klinik kesehatan mahasiswa",
      "ATM Center (BNI, BRI, BCA, Mandiri)",
      "Koperasi mahasiswa",
      "Fotokopi dan print center",
    ],
    olahraga: [
      "Lapangan futsal (indoor)",
      "Lapangan basket",
      "Lapangan badminton (4 court)",
      "Kolam renang",
      "Gym / fitness center",
    ],
    akomodasi: {
      asrama: "Tersedia asrama putra dan putri, kapasitas 500 mahasiswa",
      biaya_asrama: "Rp 800.000 - 1.200.000/bulan (termasuk listrik dan air)",
      kontak_asrama: "asrama@utn.ac.id",
    },
  },

  kontak_penting: {
    rektorat: {
      telepon: "(022) 123-4560",
      email: "rektor@utn.ac.id",
    },
    pmb: {
      telepon: "(022) 123-4567",
      whatsapp: "081234567890",
      email: "pmb@utn.ac.id",
    },
    baak: {
      telepon: "(022) 123-4569",
      email: "baak@utn.ac.id",
    },
    keuangan: {
      telepon: "(022) 123-4568",
      email: "keuangan@utn.ac.id",
    },
    kemahasiswaan: {
      telepon: "(022) 123-4570",
      email: "kemahasiswaan@utn.ac.id",
    },
    it_helpdesk: {
      telepon: "(022) 123-4571",
      email: "it@utn.ac.id",
      jam_layanan: "Senin-Jumat: 08.00-17.00 WIB",
    },
    keamanan_24jam: {
      telepon: "(022) 123-4572",
    },
  },

  jam_layanan_kampus: {
    hari_kerja: "Senin - Jumat: 07.30 - 17.00 WIB",
    sabtu: "08.00 - 12.00 WIB (terbatas)",
    minggu_libur_nasional: "Tutup (kecuali ada pemberitahuan khusus)",
    perpustakaan: "Senin - Jumat: 08.00 - 20.00 WIB, Sabtu: 08.00 - 14.00 WIB",
    klinik: "Senin - Jumat: 08.00 - 16.00 WIB",
  },

  kalender_akademik: {
    semester_ganjil: {
      awal_kuliah: "September",
      uts: "November (minggu ke-2 dan ke-3)",
      uas: "Januari",
      pengumuman_nilai: "2 minggu setelah UAS",
    },
    semester_genap: {
      awal_kuliah: "Februari",
      uts: "April (minggu ke-2 dan ke-3)",
      uas: "Juni",
      pengumuman_nilai: "2 minggu setelah UAS",
    },
    catatan: "Kalender akademik lengkap tersedia di portal.utn.ac.id",
  },

  unit_kegiatan_mahasiswa: {
    deskripsi: "UTN memiliki lebih dari 30 UKM aktif",
    kategori: [
      "Olahraga (futsal, basket, bulu tangkis, renang, pencak silat)",
      "Seni (paduan suara, teater, seni rupa, tari)",
      "Akademik (robotika, programming club, English club)",
      "Kerohanian (LDK Islam, PMK, KMK)",
      "Pers mahasiswa dan jurnalistik",
    ],
    cara_bergabung:
      "Registrasi saat OSPEK atau datang langsung ke sekretariat UKM",
    kontak: "kemahasiswaan@utn.ac.id",
  },
};

/**
 * Contoh quick questions yang ditampilkan di UI
 */
const QUICK_QUESTIONS = [
  "Apa saja syarat pendaftaran?",
  "Berapa biaya pendaftaran?",
  "Bagaimana cara isi KRS?",
  "Di mana lokasi kampus?",
  "Apakah ada beasiswa?",
  "Apa saja prodi yang tersedia?",
  "Jam layanan BAAK?",
  "Bagaimana cara bayar UKT?",
];

/**
 * Konfigurasi model default
 */
const DEFAULT_MODEL_CONFIG = {
  model: "qwen2.5-coder:7b",
  stream: true,
  options: {
    temperature: 0.1,
    top_p: 0.9,
    num_ctx: 8192, // 8192 diperlukan agar campus memory muat dalam context window
  },
};

/**
 * Endpoint Ollama default
 */
// Gunakan container Ollama yang sudah berjalan pada localhost:11434
const OLLAMA_ENDPOINT = "http://localhost:11434/api/chat";
