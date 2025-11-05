import { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { AddExamModal } from './AddExamModal';

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

type ExamListPageProps = {
  classId: string
}

export function ExamListPage({ classId }: ExamListPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const itemsPerPage = 3;
  const navigate = useNavigate()

  const filteredExams = initialExams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pt-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search exams by name..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddExamModalOpen(true)} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors w-full md:w-auto">
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
              onClick={() => navigate(`/dashboard/exam/${exam.id}?classId=${classId}`)}
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
        <span className="text-[#1e1e1e]">Page {currentPage} of {Math.ceil(filteredExams.length / itemsPerPage)}</span>
        <Button
          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredExams.length / itemsPerPage), prev + 1))}
          disabled={currentPage === Math.ceil(filteredExams.length / itemsPerPage)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors"
        >
          Next
        </Button>
      </div>
      <AddExamModal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} />
    </div>
  );
}
