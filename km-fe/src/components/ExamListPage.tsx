import { useState } from 'react';
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Exam {
  id: string;
  title: string;
  date: string;
  duration: number;
}

const initialExams: Exam[] = [
  { id: '1', title: 'Midterm Exam', date: '2025-11-15', duration: 90 },
  { id: '2', title: 'Final Exam', date: '2025-12-15', duration: 120 },
  { id: '3', title: 'Quiz 1', date: '2025-10-20', duration: 30 },
  { id: '4', title: 'Quiz 2', date: '2025-11-05', duration: 30 },
];

export function ExamListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = initialExams.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pt-4">
      <div className="flex justify-end mb-8">
        <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors">
          Add Exam
        </Button>
      </div>
      <div className="grid gap-4">
        {currentExams.map(exam => (
          <Card key={exam.id} className="flex items-center justify-between p-4 shadow-sm rounded-lg border border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1e1e1e]">{exam.title}</CardTitle>
              <p className="text-sm text-[#6b7280]">Date: {exam.date} | Duration: {exam.duration} mins</p>
            </div>
            <Button
              variant="outline"
              className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white rounded-lg px-4 py-2 transition-colors"
            >
              View Details
            </Button>
          </Card>
        ))}
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
        <span className="text-[#1e1e1e]">Page {currentPage} of {Math.ceil(initialExams.length / itemsPerPage)}</span>
        <Button
          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(initialExams.length / itemsPerPage), prev + 1))}
          disabled={currentPage === Math.ceil(initialExams.length / itemsPerPage)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
