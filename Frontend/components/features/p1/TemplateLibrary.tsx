'use client';

import { useState } from 'react';
import { useTemplateLibrary } from '@/hooks/use-p1-features';
import { Loader2, Search, Grid3x3, List, Check } from 'lucide-react';
import Image from 'next/image';

interface TemplateLibraryProps {
  onTemplateSelect?: (templateId: string) => void;
}

export function TemplateLibrary({ onTemplateSelect }: TemplateLibraryProps) {
  const { data: templates, isLoading, error } = useTemplateLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading templates</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No templates available</p>
      </div>
    );
  }

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect?.(templateId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Template Library</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 gap-4'
            : 'space-y-3'
        }
      >
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-blue-400 ${
              selectedTemplate === template.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="relative aspect-video bg-gray-100">
              <Image
                src={template.thumbnail}
                alt={template.name}
                fill
                className="object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium text-sm text-gray-900">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">{template.category}</div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No templates found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
