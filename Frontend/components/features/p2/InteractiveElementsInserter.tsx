/**
 * Interactive Elements Inserter Component (P2.4)
 * Create polls, quizzes, and Q&A sessions
 */

'use client';

import { useState } from 'react';
import { useInteractiveElements } from '@/hooks/use-p2-features';
import { BarChart3, Brain, MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';

type ElementType = 'poll' | 'quiz' | 'qa';

export function InteractiveElementsInserter({ slideId }: { slideId: string }) {
  const { data: interactiveFeature, isLoading } = useInteractiveElements();
  const [elementType, setElementType] = useState<ElementType>('poll');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!interactiveFeature) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900">Add Interactive Element</h3>

      {/* Element Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setElementType('poll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            elementType === 'poll'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Poll
        </button>
        <button
          onClick={() => setElementType('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            elementType === 'quiz'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          Quiz
        </button>
        <button
          onClick={() => setElementType('qa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            elementType === 'qa'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Q&A
        </button>
      </div>

      {/* Element Creator */}
      {elementType === 'poll' && <PollCreator feature={interactiveFeature} />}
      {elementType === 'quiz' && <QuizCreator feature={interactiveFeature} />}
      {elementType === 'qa' && <QACreator feature={interactiveFeature} />}
    </div>
  );
}

function PollCreator({ feature }: { feature: any }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState<'multiple-choice' | 'rating' | 'yes-no'>('multiple-choice');

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    try {
      await feature.createPoll({
        question,
        options,
        type: pollType,
      });
      // Reset form
      setQuestion('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Poll Type
        </label>
        <select
          value={pollType}
          onChange={(e) => setPollType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="rating">Rating (1-5)</option>
          <option value="yes-no">Yes/No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is your question?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {pollType === 'multiple-choice' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addOption}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={!question || (pollType === 'multiple-choice' && options.some(o => !o))}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Poll
      </button>
    </div>
  );
}

function QuizCreator({ feature }: { feature: any }) {
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);
  const [timeLimit, setTimeLimit] = useState(60);

  const handleCreate = async () => {
    try {
      await feature.createQuiz({
        questions,
        timeLimit,
      });
    } catch (error) {
      console.error('Failed to create quiz:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Limit (seconds)
        </label>
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <p className="text-sm text-gray-600">
        Quiz functionality with multiple questions coming soon...
      </p>

      <button
        onClick={handleCreate}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        Create Quiz
      </button>
    </div>
  );
}

function QACreator({ feature }: { feature: any }) {
  const [topic, setTopic] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const handleCreate = async () => {
    try {
      await feature.createQA({
        topic,
        allowAnonymous,
      });
      setTopic('');
    } catch (error) {
      console.error('Failed to create Q&A:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What topic should the Q&A cover?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={allowAnonymous}
          onChange={(e) => setAllowAnonymous(e.target.checked)}
          className="w-4 h-4 text-purple-600"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700">
          Allow anonymous questions
        </label>
      </div>

      <button
        onClick={handleCreate}
        disabled={!topic}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Q&A Session
      </button>
    </div>
  );
}
