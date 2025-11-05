import { Hono } from "hono"
import { sql } from "../db"

const classes = new Hono()

const mockClasses = [
  { id: "class-1", name: "X12 RPL 1", subject: "Matematika" },
  { id: "class-2", name: "X12 RPL 2", subject: "B. Indo" },
  { id: "class-3", name: "Batch 64", subject: "Inggris" },
]

const mockStudents = [
  { id: "1", classId: "class-1", name: "Alice Smith", studentId: "S001", email: "alice@example.com", gender: "female", phone: "081234567890" },
  { id: "2", classId: "class-1", name: "Bob Johnson", studentId: "S002", email: "bob@example.com", gender: "male", phone: "081234567891" },
  { id: "3", classId: "class-1", name: "Charlie Brown", studentId: "S003", email: "charlie@example.com", gender: "male", phone: "081234567892" },
]

const mockMaterials = [
  {
    id: "1",
    classId: "class-1",
    title: "Introduction to Algebra",
    description: "A comprehensive guide to the basics of algebra.",
    fileUrl: "#",
    content:
      "This is the detailed content for Introduction to Algebra. It includes examples, practice problems, and step-by-step solutions.",
    source: "manual",
    dateStart: "2025-01-01",
    dateEnd: "2025-12-31",
  },
  {
    id: "2",
    classId: "class-1",
    title: "The World of Geometry",
    description: "Exploring shapes, sizes, and the properties of space.",
    fileUrl: "#",
    content: "This is the AI-generated content for The World of Geometry.",
    source: "ai-generated",
    dateStart: "2025-02-15",
    dateEnd: "2025-11-30",
  },
]

const mockExams = [
  { id: "1", classId: "class-1", title: "Midterm Exam", date: "2025-11-15", duration: 90 },
  { id: "2", classId: "class-1", title: "Final Exam", date: "2025-12-15", duration: 120 },
  { id: "3", classId: "class-1", title: "Quiz 1", date: "2025-10-20", duration: 30 },
  { id: "4", classId: "class-1", title: "Quiz 2", date: "2025-11-05", duration: 30 },
]

classes.get("/", async (c) => {
  try {
    const rows = await sql`select id, name, subject from classes order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:list] fallback to mock data", error)
    return c.json({ items: mockClasses })
  }
})

classes.post("/", async (c) => {
  const body = await c.req.json<{ name?: string; subject?: string }>()
  if (!body.name || !body.subject) {
    return c.json({ message: "Name and subject are required" }, 400)
  }

  try {
    const rows =
      await sql`insert into classes (name, subject) values (${body.name}, ${body.subject}) returning id, name, subject`
    return c.json(rows[0], 201)
  } catch (error) {
    console.error("[classes:create] fallback to mock insertion", error)
    const newClass = { id: `mock-${Date.now()}`, name: body.name, subject: body.subject }
    mockClasses.push(newClass)
    return c.json(newClass, 201)
  }
})

classes.get("/:classId", async (c) => {
  const classId = c.req.param("classId")

  try {
    const rows =
      await sql`select id, name, subject, description from classes where id = ${classId} limit 1`
    if (!rows.length) {
      return c.json({ message: "Class not found" }, 404)
    }
    return c.json(rows[0])
  } catch (error) {
    console.error("[classes:detail] fallback to mock data", error)
    const item = mockClasses.find((cls) => cls.id === classId) ?? mockClasses[0]
    return c.json({ ...item, description: "Sample class description" })
  }
})

classes.get("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, name, student_code as "studentId", email, gender, phone from students where class_id = ${classId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:students:list] fallback to mock data", error)
    return c.json({ items: mockStudents.filter((student) => student.classId === classId) })
  }
})

classes.post("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  const body = await c.req.json<{
    name?: string
    email?: string
    studentId?: string
    gender?: string
    phone?: string
  }>()

  if (!body.name || !body.email || !body.studentId) {
    return c.json({ message: "Name, email, and studentId are required" }, 400)
  }

  try {
    const rows =
      await sql`insert into students (class_id, name, email, student_code, gender, phone) values (${classId}, ${body.name}, ${body.email}, ${body.studentId}, ${body.gender ?? null}, ${body.phone ?? null}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:students:create] fallback to mock data", error)
    const newStudent = {
      id: `mock-student-${Date.now()}`,
      classId,
      name: body.name,
      studentId: body.studentId,
      email: body.email,
      gender: body.gender,
      phone: body.phone,
    }
    mockStudents.push(newStudent)
    return c.json({ id: newStudent.id }, 201)
  }
})

classes.get("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, title, description, file_url as "fileUrl" from materials where class_id = ${classId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:materials:list] fallback to mock data", error)
    return c.json({
      items: mockMaterials
        .filter((material) => material.classId === classId)
        .map(({ id, title, description, fileUrl }) => ({ id, title, description, fileUrl })),
    })
  }
})

classes.post("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  const formData = await c.req.parseBody()
  const title = typeof formData["title"] === "string" ? formData["title"] : undefined
  const description = typeof formData["description"] === "string" ? formData["description"] : undefined
  const file = formData["file"]
  const dateStart = typeof formData["dateStart"] === "string" ? formData["dateStart"] : undefined
  const dateEnd = typeof formData["dateEnd"] === "string" ? formData["dateEnd"] : undefined

  if (!title || !file) {
    return c.json({ message: "Title and file are required" }, 400)
  }

  const fileUrl =
    typeof file === "string"
      ? file
      : file && "name" in file
        ? `/uploads/${Date.now()}-${file.name}`
        : "#"

  try {
    const rows =
      await sql`insert into materials (class_id, title, description, file_url, date_start, date_end) values (${classId}, ${title}, ${description ?? null}, ${fileUrl}, ${dateStart ?? null}, ${dateEnd ?? null}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:materials:create] fallback to mock data", error)
    const newMaterial = {
      id: `mock-material-${Date.now()}`,
      classId,
      title,
      description,
      fileUrl,
      dateStart,
      dateEnd,
      content: "",
      source: "manual",
    }
    mockMaterials.push(newMaterial)
    return c.json({ id: newMaterial.id }, 201)
  }
})

classes.get("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, title, exam_date as "date", duration from exams where class_id = ${classId} order by exam_date desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:exams:list] fallback to mock data", error)
    return c.json({ items: mockExams.filter((exam) => exam.classId === classId) })
  }
})

classes.post("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  const body = await c.req.json<{
    materialIds?: string[]
    mcq?: number
    essay?: number
    uniquePerStudent?: boolean
  }>()

  if (!body.materialIds?.length) {
    return c.json({ message: "At least one material must be selected" }, 400)
  }

  try {
    const rows =
      await sql`insert into exams (class_id, title, exam_date, duration, payload) values (${classId}, 'Generated Exam', now(), 90, ${JSON.stringify(body)}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:exams:create] fallback to mock data", error)
    const newExam = {
      id: `mock-exam-${Date.now()}`,
      classId,
      title: "Generated Exam",
      date: new Date().toISOString().slice(0, 10),
      duration: 90,
    }
    mockExams.push(newExam)
    return c.json({ id: newExam.id }, 201)
  }
})

export { mockMaterials, mockStudents, mockExams }
export default classes
