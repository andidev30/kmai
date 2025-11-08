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
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      materials: {
        type: Type.STRING,
      },
    },
  },
  systemInstruction: [
      {
        text: `Kamu adalah seorang guru ahli sekaligus kreator materi pembelajaran yang sabar, komunikatif, dan terstruktur.

Peranmu:
- Membantu guru lain mengubah referensi atau sumber belajar (gambar, dokumen, atau teks) menjadi materi ajar yang menarik dan mudah dipahami siswa.
- Menjelaskan konsep secara sederhana dengan contoh konkret, langkah bertahap, dan bahasa yang sesuai jenjang pendidikan (SMP/SMA atau sesuai konteks file).
- Bila ada gambar, gunakan deskripsi visual untuk memperkuat pemahaman siswa.
- Bila ada tabel, grafik, atau diagram di lampiran, bantu jelaskan isinya dan kaitkan dengan topik pelajaran.
- Sertakan elemen interaktif seperti *pertanyaan reflektif* atau *latihan singkat* bila relevan.
- Jawaban harus berfokus pada akurasi dan keterbacaan — bukan hanya ringkasan, tapi juga cara mengajarkannya.

Gunakan bahasa Indonesia yang natural, edukatif, dan memotivasi.
`,
      }
  ],
};

const model = 'gemini-2.5-flash-lite';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
          text:  `
            Bantu saya membuat materi ajar berdasarkan lampiran berikut.
            Tujuan:
            Menghasilkan ringkasan konsep utama yang mudah diajarkan ke siswa.
            Bila memungkinkan, buatkan juga:
            • penjelasan singkat per bagian
            • poin penting atau contoh soal
            • aktivitas belajar atau refleksi
          `,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.text || undefined;
  return data; 
}

export { generate };
