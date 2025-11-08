# API Needs for km-fe

| Feature | Endpoint | Method | Description | Request Body | Response |
|----------|-----------|---------|--------------|---------------|-----------|
| auth/login | `/api/auth/login` | POST | Authenticate a user with email and password | `{ "email": string, "password": string }` | `{ "token": string, "user": { "id": string, "name": string, "role": "teacher" | "admin" } }` |
| auth/register | `/api/auth/register` | POST | Register a new teacher account | `{ "fullName": string, "email": string, "password": string }` | `{ "id": string, "token": string }` |
| classes/list | `/api/classes` | GET | Fetch all classes visible to the current user | – | `{ "items": [ { "id": string, "name": string, "subject": string } ] }` |
| classes/create | `/api/classes` | POST | Create a new class workspace | `{ "name": string, "subject": string }` | `{ "id": string, "name": string, "subject": string }` |
| classes/detail | `/api/classes/:classId` | GET | Retrieve class overview information | – | `{ "id": string, "name": string, "subject": string, "description": string }` |
| classes/students/list | `/api/classes/:classId/students` | GET | Fetch enrolled students for a class | – | `{ "items": [ { "id": string, "name": string, "studentId": string, "email": string } ] }` |
| classes/students/create | `/api/classes/:classId/students` | POST | Add a new student to the class roster | `{ "name": string, "email": string, "studentId": string, "gender"?: string, "phone"?: string }` | `{ "id": string }` |
| classes/materials/list | `/api/classes/:classId/materials` | GET | List learning materials for a class | – | `{ "items": [ { "id": string, "title": string, "description": string, "status": "pending" | "done", "files": [{ "uri": string, "gcsUri": string, "mimeType": string, "name": string }] } ] }` |
| classes/materials/create | `/api/classes/:classId/materials` | POST | Upload a new learning material record | multipart/form-data `{ title, description?, startDate?, endDate?, files[] }` | `{ "id": string, "status": "pending" | "done", "files": [{ "uri": string, "gcsUri": string, "mimeType": string, "name": string }] }` |
| materials/detail | `/api/materials/:materialId` | GET | Fetch material metadata and content summary | – | `{ "id": string, "title": string, "description": string, "content": string, "status": "pending" | "done", "files": [{ "uri": string, "gcsUri": string, "mimeType": string, "name": string }], "dateStart": string, "dateEnd": string }` |
| classes/exams/list | `/api/classes/:classId/exams` | GET | Retrieve exams associated with a class | – | `{ "items": [ { "id": string, "title": string, "date": string, "duration": number } ] }` |
| classes/exams/create | `/api/classes/:classId/exams` | POST | Generate a new exam based on materials | `{ "materialIds": string[], "mcq": number, "essay": number, "uniquePerStudent": boolean }` | `{ "id": string }` |
| exams/detail | `/api/exams/:examId` | GET | Fetch exam overview and per-student grading status | – | `{ "id": string, "title": string, "description": string, "date": string, "duration": number, "students": [ { "id": string, "name": string, "status": "graded" | "grading" | "not-submitted" } ] }` |
| exams/student/upload | `/api/exams/:examId/students/:studentId/upload` | POST | Upload a scanned/photo answer sheet for a student | multipart/form-data `{ file }` | `{ "message": string }` |
| exams/student/download | `/api/exams/:examId/students/:studentId/download` | GET | Download a student&apos;s answer submission | – | Binary file stream |
| exams/download/questions | `/api/exams/:examId/download` | GET | Download compiled exam questions | – | Binary file stream |
| students/detail | `/api/students/:studentId` | GET | Retrieve student profile, strengths, challenges, and exam summaries | – | `{ "id": string, "name": string, "overview": string, "strengths": string[], "challenges": string[], "exams": [ { "id": string, "title": string, "summary": string, "details": string } ] }` |
