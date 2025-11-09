import { GoogleGenAI, Type } from "@google/genai"
const config = {
  temperature: 0.3,
  imageConfig: {
    imageSize: '1K',
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["overview", "strengths", "challenges"],
    properties: {
      overview: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  },
  systemInstruction: [
    {
      text: `Anda adalah AI pendamping guru.
Hasilkan ringkasan profil siswa yang singkat dan konkret.`,
    },
  ],
}

const model = "gemini-2.5-flash"

const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT || "hackathon-gcp-cloud-run",
  vertexai: true,
  googleAuthOptions: {
    keyFilename:
      process.env.NODE_ENV === "development"
        ? "/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json"
        : undefined,
  },
})

type OverviewInput = {
  studentName: string
  previous?: {
    overview?: string | null
    strengths?: string[] | null
    challenges?: string[] | null
  }
  recent?: Array<{ title: string; score: number; feedback?: string | null }>
  materials?: Array<{ title: string; content?: string }>
}

export async function generateOverview(input: OverviewInput) {
  const previousText = `
Sebelumnya:
Overview: ${input.previous?.overview ?? "(tidak ada)"}
Kekuatan: ${(input.previous?.strengths ?? []).join(", ") || "(tidak ada)"}
Tantangan: ${(input.previous?.challenges ?? []).join(", ") || "(tidak ada)"}
`.trim()

  const recentText = (input.recent ?? [])
    .map((r) => `- ${r.title}: ${r.score}/100${r.feedback ? ` — ${r.feedback}` : ""}`)
    .join("\n")

  const materialsText = (input.materials ?? [])
    .map((m) => `- ${m.title}${m.content ? ` — ${m.content.slice(0, 200)}...` : ""}`)
    .join("\n")

  const prompt = `
Perbarui ringkasan profil siswa berdasarkan data berikut.

Nama siswa: ${input.studentName}

${previousText}

Materi pendukung:
${materialsText || "(tidak ada)"}

Hasil ujian terbaru:
${recentText || "(tidak ada)"}

Keluarkan JSON dengan kunci: overview (string), strengths (array string), challenges (array string). Tanpa teks lain.
`.trim()

  const response = await ai.models.generateContent({
    model,
    config,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
  try {
    const parsed = JSON.parse(text) as {
      overview?: string
      strengths?: string[]
      challenges?: string[]
    }
    return {
      overview: String(parsed.overview ?? ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
    }
  } catch {
    return { overview: "", strengths: [], challenges: [] }
  }
}
