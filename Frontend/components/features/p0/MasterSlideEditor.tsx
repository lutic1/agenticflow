'use client';

import { useState } from 'react';
import { useMasterSlides } from '@/hooks/use-p0-features';
import { Loader2, Layout, Copy, Edit, Trash2 } from 'lucide-react';

interface MasterSlideEditorProps {
  presentationId: string;
  onMasterChange?: (master: any) => void;
}

export function MasterSlideEditor({ presentationId, onMasterChange }: MasterSlideEditorProps) {
  const { data: masterSlides, isLoading, error } = useMasterSlides();
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading master slides...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading master slides: {error.message}</p>
      </div>
    );
  }

  const defaultMasters = [
    {
      id: 'title',
      name: 'Title Slide',
      description: 'Large centered title with subtitle',
      preview: 'Title layout with centered content',
    },
    {
      id: 'content',
      name: 'Content Slide',
      description: 'Title with bullet points or content',
      preview: 'Header + content area layout',
    },
    {
      id: 'two-column',
      name: 'Two Column',
      description: 'Split content into two columns',
      preview: 'Two-column split layout',
    },
    {
      id: 'image-text',
      name: 'Image & Text',
      description: 'Image on left, text on right',
      preview: 'Image-text combination layout',
    },
  ];

  const handleMasterSelect = (masterId: string) => {
    setSelectedMaster(masterId);
    onMasterChange?.(defaultMasters.find((m) => m.id === masterId));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Master Slides
        </h3>
        <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create New
        </button>
      </div>

      {/* Master Slide List */}
      <div className="space-y-2">
        {defaultMasters.map((master) => {
          const isSelected = selectedMaster === master.id;

          return (
            <div
              key={master.id}
              className={`p-3 border-2 rounded-lg transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <button
                  onClick={() => handleMasterSelect(master.id)}
                  className="flex-1 text-left"
                >
                  <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {master.name}
                  </div>
                  <div className="text-xs text-gray-500">{master.description}</div>
                </button>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                {master.preview}
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply to Slides */}
      {selectedMaster && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Apply to Slides</label>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Current Slide
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              All Slides
            </button>
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Master slides ensure consistent design across your presentation.
          Changes to a master slide automatically update all slides using that master.
        </p>
      </div>
    </div>
  );
}
