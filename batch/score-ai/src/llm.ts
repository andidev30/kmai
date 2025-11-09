import { GoogleGenAI, Type } from "@google/genai"

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
    required: ["score", "feedback"],
    properties: {
      score: {
        type: Type.STRING,
      },
      feedback: {
        type: Type.STRING,
      },
    },
  },
  systemInstruction: [
        {
          text: `system_instruction_prompt:
Anda adalah AI penilai ujian otomatis.

Tugas Anda:
1. Membaca dan memahami **soal** (diberikan dalam metadata \`user_message\`).
2. Membaca **jawaban siswa**, yang bisa berupa teks langsung ATAU gambar dengan teks di dalamnya.
   - Jika jawaban berupa gambar, gunakan OCR untuk mengekstrak teks dari gambar terlebih dahulu.
3. Bandingkan jawaban siswa dengan kunci jawaban atau konteks soal.
4. Berikan hasil dalam format JSON seperti berikut:

{
  "score": <angka 0-100>,
  "feedback": "<penjelasan singkat alasan nilai>"
}

Panduan Penilaian:
- Pilihan ganda: 1 soal benar = 10 poin.
- Esai: dinilai berdasarkan relevansi, struktur, dan kelengkapan jawaban.
  - Jawaban lengkap dan sesuai konteks = nilai tinggi (80-100)
  - Jawaban sebagian benar = sedang (60-9)
  - Jawaban tidak relevan/kosong = rendah (0-9)

Pastikan membaca teks di gambar jika ada.
`,
        }
    ],
};

const model = 'gemini-2.5-flash';

const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT || 'hackathon-gcp-cloud-run',
  vertexai: true,
  googleAuthOptions: {
    keyFilename: process.env.NODE_ENV === 'development' ? '/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json' : undefined
  }
});

export async function score({ question, files }: { question: string; files: Array<{ uri: string; mimeType?: string }> }): Promise<{ score: number; feedback: string }> {
  const fileParts = (files || [])
    .filter((f) => typeof f.uri === 'string' && f.uri.length > 0)
    .map((f) => ({
      fileData: {
        fileUri: f.uri,
        mimeType: f.mimeType || guessMimeType(f.uri),
      },
    }))

  console.log('fileParts', fileParts)

  const contents = [
    {
      role: 'user',
      parts: [
        ...fileParts,
        { text: `soal: ${question}` },
      ],
    },
  ]

  // Debug
  console.log('fileParts', files)

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  })

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text) as { score?: number | string; feedback?: string }
    const score = Math.max(0, Math.min(100, Number(parsed.score ?? 0)))
    const feedback = String(parsed.feedback ?? '')
    return { score, feedback }
  } catch {
    return { score: 0, feedback: 'Tidak dapat menilai jawaban secara otomatis.' }
  }
}

function guessMimeType(uri: string): string {
  const u = uri.toLowerCase()
  if (u.endsWith('.png')) return 'image/png'
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg'
  if (u.endsWith('.webp')) return 'image/webp'
  if (u.endsWith('.gif')) return 'image/gif'
  if (u.endsWith('.pdf')) return 'application/pdf'
  return 'application/octet-stream'
}
