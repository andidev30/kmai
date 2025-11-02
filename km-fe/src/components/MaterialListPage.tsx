import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
];

export function MaterialListPage() {
  return (
    <div className="pt-4">
      <div className="flex justify-end mb-8">
        <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors">
          Add Material
        </Button>
      </div>
      <div className="grid gap-4">
        {initialMaterials.map(material => (
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
    </div>
  );
}
