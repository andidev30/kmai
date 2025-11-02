import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

interface Student {
  id: string;
  name: string;
  studentId: string;
}

const initialStudents: Student[] = [
  { id: '1', name: 'Alice Smith', studentId: 'S001' },
  { id: '2', name: 'Bob Johnson', studentId: 'S002' },
  { id: '3', name: 'Charlie Brown', studentId: 'S003' },
  { id: '4', name: 'Diana Prince', studentId: 'S004' },
  { id: '5', name: 'Clark Kent', studentId: 'S005' },
];

export function StudentListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredStudents = initialStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const onAddStudent = () => {
    alert('Add new student functionality will be implemented here!');
    // TODO: Implement modal or redirect to add student form
  };

  const onViewProgress = (studentId: string) => {
    alert(`View progress for student: ${studentId}`);
    // TODO: Implement navigation to /dashboard/class/:id/student/:studentId or open modal
  };

  return (
    <div className="pt-4">
      {/* Top Section: Search and Add Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search students by name..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={onAddStudent}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors w-full md:w-auto"
        >
          Add Student
        </Button>
      </div>


      {/* Student List */}
      <div className="grid gap-4">
        {currentStudents.length > 0 ? (
          currentStudents.map(student => (
            <Card key={student.id} className="flex items-center justify-between p-4 shadow-sm rounded-lg border border-gray-200">
              <div>
                <CardTitle className="text-lg font-semibold text-[#1e1e1e]">{student.name}</CardTitle>
                <p className="text-sm text-[#6b7280]">ID: {student.studentId}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => onViewProgress(student.id)}
                className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white rounded-lg px-4 py-2 transition-colors"
              >
                View Progress
              </Button>
            </Card>
          ))
        ) : (
          <p className="text-center text-[#6b7280]">No students found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors"
        >
          Previous
        </Button>
        <span className="text-[#1e1e1e]">Page {currentPage} of {Math.ceil(filteredStudents.length / itemsPerPage)}</span>
        <Button
          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / itemsPerPage), prev + 1))}
          disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
