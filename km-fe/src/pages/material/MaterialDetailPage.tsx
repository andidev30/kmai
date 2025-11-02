import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  source: 'manual' | 'ai-generated';
  content: string;
  attachment: string;
  aiResultAnalyze?: string;
  dateStart: string;
  dateEnd: string;
}

const mockMaterials: Material[] = [
  { id: '1', title: 'Introduction to Algebra', description: 'A comprehensive guide to the basics of algebra, covering fundamental concepts like variables, equations, and inequalities. This material is designed for beginners.', fileUrl: '#', source: 'manual', content: 'This is the detailed content for Introduction to Algebra. It includes examples, practice problems, and step-by-step solutions to help students grasp the concepts effectively. The module is structured into several chapters, each focusing on a specific algebraic topic, from basic operations to solving complex equations. Students are encouraged to work through all exercises.', attachment: 'algebra_intro.pdf', aiResultAnalyze: 'N/A', dateStart: '2025-01-01', dateEnd: '2025-12-31' },
  { id: '2', title: 'The World of Geometry', description: 'Exploring shapes, sizes, and the properties of space, including Euclidean geometry, transformations, and proofs. This material is AI-generated to provide a dynamic learning experience.', fileUrl: '#', source: 'ai-generated', content: 'This is the AI-generated content for The World of Geometry. It features interactive diagrams and simulations to visualize geometric concepts. The AI analysis suggests that this material is highly effective for visual learners and covers advanced topics such as non-Euclidean geometries and their applications in modern physics. It also includes a section on the history of geometry.', attachment: 'geometry_world.pdf', aiResultAnalyze: 'AI analysis indicates high engagement for visual learners. Covers basic shapes, theorems, transformations, and introduces non-Euclidean concepts. Recommended for a broad audience.', dateStart: '2025-02-15', dateEnd: '2025-11-30' },
  { id: '3', title: 'Calculus Made Easy', description: 'A simplified approach to understanding calculus, focusing on derivatives, integrals, and their applications in real-world scenarios. Perfect for students struggling with traditional calculus textbooks.', fileUrl: '#', source: 'manual', content: 'This is the content for Calculus Made Easy. The material breaks down complex calculus topics into digestible parts, using analogies and practical examples. It emphasizes problem-solving strategies and provides numerous exercises with detailed solutions. The goal is to demystify calculus and make it accessible to all students, regardless of their prior mathematical background.', attachment: 'calculus_easy.docx', aiResultAnalyze: 'N/A', dateStart: '2025-03-01', dateEnd: '2025-10-15' },
  { id: '4', title: 'History of Science', description: 'A journey through the history of scientific discoveries, from ancient civilizations to the modern era. This AI-generated material highlights key scientific breakthroughs and the scientists behind them.', fileUrl: '#', source: 'ai-generated', content: 'This is the AI-generated content for History of Science. It provides a chronological overview of major scientific advancements, including the Copernican Revolution, Newton\'s laws, Darwin\'s theory of evolution, and the development of quantum mechanics. The AI analysis suggests that this material is comprehensive and well-structured, offering a rich historical context for scientific concepts. It also includes biographies of influential scientists.', attachment: 'science_history.ppt', aiResultAnalyze: 'Comprehensive overview of scientific history. Highlights key breakthroughs and influential figures. Suitable for general knowledge and introductory courses.', dateStart: '2025-04-10', dateEnd: '2025-09-30' },
  { id: '5', title: 'Physics for Dummies', description: 'A simple guide to the fundamental principles of physics, including mechanics, thermodynamics, electromagnetism, and optics. Designed for students who need a clear and concise introduction to physics.', fileUrl: '#', source: 'manual', content: 'This is the content for Physics for Dummies. It covers essential physics concepts with clear explanations, practical examples, and easy-to-understand diagrams. The material avoids complex mathematical derivations, focusing instead on conceptual understanding and real-world applications. It is an ideal resource for students taking their first physics course or those needing a refresher.', attachment: 'physics_dummies.pdf', aiResultAnalyze: 'N/A', dateStart: '2025-05-01', dateEnd: '2025-08-31' },
  { id: '6', title: 'Advanced Calculus', description: 'Deep dive into advanced calculus concepts, including multi-variable calculus, vector calculus, and differential equations. This AI-generated material offers challenging problems and theoretical insights.', fileUrl: '#', source: 'ai-generated', content: 'This is the AI-generated content for Advanced Calculus. It delves into complex topics such as partial derivatives, multiple integrals, line integrals, and Green\'s Theorem. The AI analysis indicates that this material is suitable for advanced undergraduate or graduate students, providing rigorous proofs and challenging exercises. It also explores applications in engineering and physics.', attachment: 'adv_calculus.pdf', aiResultAnalyze: 'Advanced topics in calculus. Rigorous and challenging. Best for students with a strong mathematical background.', dateStart: '2025-06-01', dateEnd: '2025-12-01' },
  { id: '7', title: 'Literary Analysis', description: 'Techniques for analyzing literature, including poetry, prose, and drama. This material covers literary devices, critical theories, and essay writing strategies.', fileUrl: '#', source: 'manual', content: 'This is the content for Literary Analysis. It guides students through the process of interpreting literary texts, identifying themes, symbols, and narrative structures. The material includes examples from various literary works and provides practical advice on writing analytical essays. It is an essential resource for literature students.', attachment: 'literary_analysis.docx', aiResultAnalyze: 'N/A', dateStart: '2025-07-01', dateEnd: '2025-11-15' },
  { id: '8', title: 'Chemistry Basics', description: 'Fundamental concepts of chemistry, including atomic structure, chemical bonding, reactions, and stoichiometry. This AI-generated material provides a solid foundation for further study in chemistry.', fileUrl: '#', source: 'ai-generated', content: 'This is the AI-generated content for Chemistry Basics. It covers the essential principles of chemistry, from the periodic table to chemical equations. The AI analysis suggests that this material is highly accessible for introductory chemistry students, offering clear explanations and numerous practice problems. It also includes a section on laboratory safety.', attachment: 'chemistry_basics.pdf', aiResultAnalyze: 'Covers fundamental chemistry concepts. Accessible for beginners. Includes practice problems and safety guidelines.', dateStart: '2025-08-01', dateEnd: '2025-10-31' },
];

export function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get('classId');
  const material = useMemo(() => mockMaterials.find(m => m.id === id), [id]);

  if (!material) {
    return <div>Material not found</div>;
  }

  return (
    <div className="pt-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{material.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{material.description}</p>
            </div>
            <Button onClick={() => navigate(`/dashboard/class?id=${classId}&tab=materials`)}>
              Back to Class
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-medium text-gray-500">Material ID</div>
                <div>{material.id}</div>
                <div className="font-medium text-gray-500">Start Date</div>
                <div>{material.dateStart}</div>
                <div className="font-medium text-gray-500">End Date</div>
                <div>{material.dateEnd}</div>
                <div className="font-medium text-gray-500">Attachment</div>
                <div className="flex items-center gap-2">
                  <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {material.attachment}
                  </a>
                  <a href={material.fileUrl} download>
                    <Download className="h-4 w-4 text-gray-500" />
                  </a>
                </div>
              </div>
            </div>
            {material.source === 'ai-generated' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">{material.aiResultAnalyze}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content</h3>
            <p className="text-sm text-muted-foreground">{material.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
