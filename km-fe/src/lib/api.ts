import { apiRequest, buildFormData } from "./api-client"

export type AuthUser = {
  id: string
  name: string
  role: string
}

export async function login(email: string, password: string) {
  return apiRequest<{ token: string; user: AuthUser }>("/auth/login", {
    body: { email, password },
  })
}

export async function register(fullName: string, email: string, password: string) {
  return apiRequest<{ id: string; token: string }>("/auth/register", {
    body: { fullName, email, password },
  })
}

export type ClassSummary = {
  id: string
  name: string
  subject: string
}

export async function listClasses() {
  return apiRequest<{ items: ClassSummary[] }>("/classes")
}

export async function createClass(payload: { name: string; subject: string }) {
  return apiRequest<ClassSummary>("/classes", { body: payload })
}

export async function getClassDetail(classId: string) {
  return apiRequest<{ id: string; name: string; subject: string; description?: string }>(
    `/classes/${classId}`,
  )
}

export type StudentSummary = {
  id: string
  name: string
  studentId: string
  email: string
  gender?: string
  phone?: string
}

export async function listClassStudents(classId: string) {
  return apiRequest<{ items: StudentSummary[] }>(`/classes/${classId}/students`)
}

export async function addClassStudent(
  classId: string,
  payload: { name: string; email: string; studentId: string; gender?: string; phone?: string },
) {
  return apiRequest<{ id: string }>(`/classes/${classId}/students`, { body: payload })
}

export type MaterialFile = {
  uri: string
  gcsUri: string
  mimeType: string
  name: string
}

export type MaterialStatus = "pending" | "done" | string
export type ExamStatus = "pending" | "done" | string

export type MaterialSummary = {
  id: string
  title: string
  description: string
  status: MaterialStatus
  files: MaterialFile[]
}

export async function listClassMaterials(classId: string) {
  return apiRequest<{ items: MaterialSummary[] }>(`/classes/${classId}/materials`)
}

export async function createClassMaterial(
  classId: string,
  payload: {
    title: string
    description?: string
    dateStart?: string
    dateEnd?: string
    files: File[]
  },
) {
  const form = new FormData()
  form.append("title", payload.title)
  if (payload.description) form.append("description", payload.description)
  if (payload.dateStart) form.append("dateStart", payload.dateStart)
  if (payload.dateEnd) form.append("dateEnd", payload.dateEnd)
  payload.files.forEach((file) => form.append("files", file))
  return apiRequest<{ id: string; status: MaterialStatus; files: MaterialFile[] }>(
    `/classes/${classId}/materials`,
    {
      method: "POST",
      rawBody: form,
    },
  )
}

export type MaterialDetail = {
  id: string
  title: string
  description: string
  content: string
  status: MaterialStatus
  files: MaterialFile[]
  dateStart?: string
  dateEnd?: string
}

export async function getMaterialDetail(materialId: string) {
  return apiRequest<MaterialDetail>(`/materials/${materialId}`)
}

export type ExamSummary = {
  id: string
  title: string
  date: string
  duration: number
  status: ExamStatus
  uniquePerStudent: boolean
}

export async function listClassExams(classId: string) {
  return apiRequest<{ items: ExamSummary[] }>(`/classes/${classId}/exams`)
}

export async function createExam(
  classId: string,
  payload: {
    title: string
    materialIds: string[]
    mcq: number
    essay: number
    uniquePerStudent: boolean
  },
) {
  return apiRequest<{ id: string; status: ExamStatus; uniquePerStudent: boolean }>(
    `/classes/${classId}/exams`,
    {
      body: payload,
    },
  )
}

export type ExamDetail = {
  id: string
  title: string
  description: string
  date: string
  duration: number
  status: ExamStatus
  uniquePerStudent: boolean
  sharedQuestion?: { id: string; content: string } | null
  students: Array<{
    id: string
    name: string
    status: "graded" | "grading" | "not-submitted"
    questionId?: string | null
    questionContent?: string | null
  }>
}

export async function getExamDetail(examId: string) {
  return apiRequest<ExamDetail>(`/exams/${examId}`)
}

export async function uploadExamAnswer(examId: string, studentId: string, file: File) {
  const form = buildFormData({ file })
  return apiRequest<{ message: string }>(`/exams/${examId}/students/${studentId}/upload`, {
    method: "POST",
    rawBody: form,
  })
}

export async function downloadExamArchive(examId: string) {
  return apiRequest<Response>(`/exams/${examId}/download`, { raw: true })
}

export async function getStudentSubmissionUrl(examId: string, studentId: string) {
  return apiRequest<{ url: string }>(`/exams/${examId}/students/${studentId}/download`)
}

export async function getStudentExamContent(examId: string, studentId: string) {
  return apiRequest<{ content: string }>(`/exams/${examId}/students/${studentId}/exam`)
}

export async function downloadStudentExamPdf(examId: string, studentId: string) {
  return apiRequest<Response>(`/exams/${examId}/students/${studentId}/exam/download`, {
    raw: true,
  })
}

export type StudentProfile = {
  id: string
  name: string
  overview: string
  strengths: string[]
  challenges: string[]
  exams: Array<{
    id: string
    title: string
    summary: string
    details: string
  }>
}

export async function getStudentProfile(studentId: string) {
  return apiRequest<StudentProfile>(`/students/${studentId}`)
}
