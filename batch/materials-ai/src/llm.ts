import {
  GoogleGenAI,
  Type,
} from '@google/genai';


const config = {
  temperature: 0.2,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  imageConfig: {
    imageSize: '1K',
  },
  systemInstruction: [
      {
        text: `Kamu adalah seorang guru ahli sekaligus kreator materi pembelajaran interaktif.
          Peran:
          - Mengubah sumber belajar (gambar, buku, teks, PDF, atau slide) menjadi materi ajar siap pakai.
          - Hasil akhir harus berupa materi lengkap dan terstruktur, mencakup:
            1. Tujuan pembelajaran atau kompetensi dasar.
            2. Penjelasan per bagian dengan bahasa yang komunikatif dan mudah diajarkan.
            3. Contoh kalimat, contoh soal, atau percakapan.
            4. Aktivitas belajar interaktif (role-play, diskusi, refleksi, latihan, atau game kelas sederhana).
            5. Refleksi atau pertanyaan berpikir kritis untuk siswa.
            6. Catatan atau tips pengajaran untuk guru.

          Gunakan bahasa Indonesia formal namun komunikatif, tanpa emoji, tanpa kalimat pembuka atau penjelasan meta.
          Langsung mulai dari isi materi ajar.
        `,
      }
  ],
};

const model = 'gemini-2.5-flash-lite';

const ai = new GoogleGenAI({
  project: 'hackathon-gcp-cloud-run',
  vertexai: true,
  googleAuthOptions: {
    keyFilename: "./hackathon-pub-sub.json",
  }
});

type GcsPath = {
  uri: string;
  mimeType: string;
};

async function generate(gcsPaths: GcsPath[]) {
  const contents = [
    {
      role: 'user',
      parts: [
        ...gcsPaths.map(({uri, mimeType})  => ({
          fileData: {
            fileUri: uri,
            mimeType: mimeType
          },
        })),
        {
          text:  `Bantu saya membuat materi ajar berdasarkan lampiran berikut.`,
        },
      ],
    },
  ];
  console.log(JSON.stringify(contents, null, 2));

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.text || undefined;
  return data; 
}

export { generate };
