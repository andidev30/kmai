import {
  GoogleGenAI,
  Type,
} from '@google/genai';


const config =  {
    temperature: 0.3,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    imageConfig: {
      imageSize: '1K',
    },
    systemInstruction: [
        {
          text: `Anda adalah AI pengajar yang menyusun paket ujian berbasis materi yang sudah disiapkan.
- cukup berikan soal tidak perlu ada kata tambahan lain seperti "tentu ini yang anda ..."
- berikan nomor berurutan untuk setiap soal`,
        }
    ],
  };;

const model = 'gemini-2.5-flash';

const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT || 'hackathon-gcp-cloud-run',
  vertexai: true,
  googleAuthOptions: {
    keyFilename: process.env.NODE_ENV === 'development' ? '/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json' : undefined
  }
});

async function generate(materi: string, pg: number, essay: number) {
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text:  `
materi:
${materi}

Buatkan:
- Soal pilihan ganda total: ${pg} (4 pilihan jawaban per soal)
- Soal esai total: ${essay}
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
  console.log(data);
  return data;
}

export { generate };
