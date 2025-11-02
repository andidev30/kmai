import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from './ui/checkbox';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MaterialOption {
  value: string;
  label: string;
}

const mockMaterials: MaterialOption[] = [
  { value: 'material-1', label: 'Algebra Practice Worksheet (Uploaded: 2025-10-20)' },
  { value: 'material-2', label: 'The World of Geometry (Uploaded: 2025-10-25)' },
  { value: 'material-3', label: 'Calculus Made Easy (Uploaded: 2025-11-01)' },
  { value: 'material-4', label: 'History of Science (Uploaded: 2025-11-05)' },
];

export function AddExamModal({ isOpen, onClose }: AddExamModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<number | string>('');
  const [essayQuestions, setEssayQuestions] = useState<number | string>('');
  const [error, setError] = useState('');
  const [generateUniqueQuestions, setGenerateUniqueQuestions] = useState(false);

  const handleMaterialSelect = (materialId: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials(prev => [...prev, materialId]);
    } else {
      setSelectedMaterials(prev => prev.filter(id => id !== materialId));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedMaterials.length === 0) {
      setError('Please select at least one material.');
      return;
    }

    if (!mcqQuestions && !essayQuestions) {
      setError('Please enter at least one question count.');
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="materials" className="text-black">Select List Materials for Exam</Label>
            <div className="border rounded-md p-4 h-48 overflow-y-auto">
              {mockMaterials.map(material => (
                <div key={material.value} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`material-${material.value}`}
                    checked={selectedMaterials.includes(material.value)}
                    onCheckedChange={(checked: boolean) => handleMaterialSelect(material.value, checked)}
                  />
                  <Label htmlFor={`material-${material.value}`} className="text-black">{material.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mcq-questions" className="text-black">Number of Questions (Multiple Choice)</Label>
            <Input
              id="mcq-questions"
              type="number"
              min="1"
              value={mcqQuestions}
              onChange={(e) => setMcqQuestions(e.target.value)}
              className="text-black"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="essay-questions" className="text-black">Number of Questions (Essay)</Label>
            <Input
              id="essay-questions"
              type="number"
              min="0"
              value={essayQuestions}
              onChange={(e) => setEssayQuestions(e.target.value)}
              className="text-black"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-unique"
              checked={generateUniqueQuestions}
              onCheckedChange={(checked: boolean) => setGenerateUniqueQuestions(checked)}
            />
            <Label htmlFor="generate-unique" className="text-black">Generate unique questions for every student</Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors">
              Generate Exam
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
