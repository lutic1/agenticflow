'use client';

import { useBackendInitialization } from '@backend/frontend-integration/hooks/use-backend';
import { Loader2, Presentation, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data, isLoading, error } = useBackendInitialization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Initializing Slide Designer</h2>
          <p className="text-gray-600">Setting up AI-powered presentation tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Presentation className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">Initialization Error</h2>
          <p className="text-red-700">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Initialization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            ✨ Powered by AI - {data?.message || 'Backend Ready'}
          </div>

          <h1 className="text-6xl font-bold text-gray-900">
            Create Stunning
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              AI-Powered Presentations
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional slide design made effortless with 12 core AI features.
            Generate, edit, and export beautiful presentations in minutes.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/presentations/new"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg shadow-lg hover:shadow-xl"
            >
              <Presentation className="w-6 h-6" />
              Create Presentation
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/presentations/demo/edit"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200"
            >
              Try Demo Editor
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Zap,
              title: '12 Core Features',
              description: 'Grid layouts, typography, colors, charts, and more - all P0 features ready to use.',
              color: 'blue',
            },
            {
              icon: Sparkles,
              title: 'AI-Powered',
              description: 'LLM judge for content quality, accessibility checks, and smart validation.',
              color: 'purple',
            },
            {
              icon: Shield,
              title: 'Production Ready',
              description: 'Export to PDF, PPTX, HTML with full type safety and error handling.',
              color: 'green',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* P0 Features Showcase */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            All 12 P0 Core Features Integrated
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Grid Layouts',
              'Typography',
              'Color Palettes',
              'Charts',
              'Text Overflow',
              'Master Slides',
              'Transitions',
              'Accessibility',
              'Export (PDF/PPTX/HTML)',
              'Image Optimizer',
              'Content Validator',
              'LLM Quality Judge',
            ].map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-center"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Status */}
        <div className="mt-16 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Backend Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ● Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">P0 Features</span>
              <span className="text-gray-900 font-medium">12/12 Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Integration</span>
              <span className="text-gray-900 font-medium">Initialized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
