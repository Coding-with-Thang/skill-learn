import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save } from "lucide-react";

const QuestionManager = ({ onAddQuestion }) => {
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: 0,
    category: 'general'
  });

  const categories = [
    { id: 'general', name: 'General Knowledge' },
    { id: 'history', name: 'History' },
    { id: 'strategy', name: 'Game Strategy' },
    { id: 'math', name: 'Mathematics' },
  ];

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...newQuestion.answers];
    newAnswers[index] = value;
    setNewQuestion({ ...newQuestion, answers: newAnswers });
  };

  const handleSubmit = () => {
    if (newQuestion.question && newQuestion.answers.every(answer => answer)) {
      onAddQuestion({ ...newQuestion });
      setNewQuestion({
        question: '',
        answers: ['', '', '', ''],
        correctAnswer: 0,
        category: 'general'
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>Add Custom Question</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={newQuestion.category}
              onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <Input
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              placeholder="Enter your question"
              className="mb-4"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Answers</label>
            {newQuestion.answers.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Answer ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                  className={newQuestion.correctAnswer === index ? "border-green-500" : ""}
                >
                  {newQuestion.correctAnswer === index ? "✓" : (index + 1)}
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!newQuestion.question || newQuestion.answers.some(answer => !answer)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionManager;