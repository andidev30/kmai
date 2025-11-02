import { useState } from 'react';
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddMaterialModal } from './AddMaterialModal';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
}

const initialMaterials: Material[] = [
  { id: '1', title: 'Introduction to Algebra', description: 'A comprehensive guide to the basics of algebra.', fileUrl: '#' },
  { id: '2', title: 'The World of Geometry', description: 'Exploring shapes, sizes, and the properties of space.', fileUrl: '#' },
  { id: '3', title: 'Calculus Made Easy', description: 'A simplified approach to understanding calculus.', fileUrl: '#' },
  { id: '4', title: 'History of Science', description: 'A journey through the history of scientific discoveries.', fileUrl: '#' },
  { id: '5', title: 'Physics for Dummies', description: 'A simple guide to the fundamental principles of physics.', fileUrl: '#' },
];

export function MaterialListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 3;

  const filteredMaterials = initialMaterials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pt-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search materials by name..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors w-full md:w-auto">
          Add Material
        </Button>
      </div>
      <div className="grid gap-4">
        {currentMaterials.map(material => (
          <Card key={material.id} className="flex items-center justify-between p-4 shadow-sm rounded-lg border border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1e1e1e]">{material.title}</CardTitle>
              <p className="text-sm text-[#6b7280]">{material.description}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(material.fileUrl, '_blank')}
              className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white rounded-lg px-4 py-2 transition-colors"
            >
              View Material
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
        <span className="text-[#1e1e1e]">Page {currentPage} of {Math.ceil(filteredMaterials.length / itemsPerPage)}</span>
        <Button
          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredMaterials.length / itemsPerPage), prev + 1))}
          disabled={currentPage === Math.ceil(filteredMaterials.length / itemsPerPage)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors"
        >
          Next
        </Button>
      </div>
      <AddMaterialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
