/**
 * API Access Panel Component (P2.6)
 * Developer API key management and documentation
 */

'use client';

import { useState } from 'react';
import { useAPIAccess } from '@/hooks/use-p2-features';
import { Key, Copy, Trash2, RefreshCw, Book, TrendingUp, Loader2 } from 'lucide-react';

export function APIAccessPanel() {
  const { data: apiFeature, isLoading } = useAPIAccess();
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!apiFeature) {
    return null;
  }

  const handleGenerateKey = async () => {
    try {
      const newKey = await apiFeature.generateKey();
      setApiKey(newKey);
      setShowKey(true);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeKey = async () => {
    try {
      await apiFeature.revokeKey(apiKey);
      setApiKey('');
      setShowKey(false);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">API Key</h3>
        </div>

        {!apiKey ? (
          <button
            onClick={handleGenerateKey}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Generate API Key
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
              />
              <button
                onClick={handleCopyKey}
                className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleRevokeKey}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                title="Revoke key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">Copied to clipboard!</p>
            )}
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {showKey ? 'Hide' : 'Show'} key
            </button>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      <UsageStats apiFeature={apiFeature} />

      {/* Code Examples */}
      <CodeExamples apiKey={apiKey} />
    </div>
  );
}

function UsageStats({ apiFeature }: { apiFeature: any }) {
  const [usage, setUsage] = useState<any>(null);

  const loadUsage = async () => {
    const stats = await apiFeature.getUsage();
    setUsage(stats);
  };

  if (!usage) {
    loadUsage();
    return null;
  }

  const percentage = (usage.requests / usage.limit) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Usage This Month</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Requests</span>
          <span className="font-semibold">
            {usage.requests.toLocaleString()} / {usage.limit.toLocaleString()}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage > 90 ? 'bg-red-600' : percentage > 70 ? 'bg-yellow-600' : 'bg-purple-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-gray-500">
          Resets on {new Date(usage.resetDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function CodeExamples({ apiKey }: { apiKey: string }) {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python'>('curl');

  const examples = {
    curl: `curl -X POST https://api.slidedesigner.com/v1/presentations \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "AI in Healthcare",
    "slideCount": 10,
    "tone": "formal"
  }'`,
    javascript: `const response = await fetch('https://api.slidedesigner.com/v1/presentations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'AI in Healthcare',
    slideCount: 10,
    tone: 'formal',
  }),
});

const data = await response.json();
console.log(data);`,
    python: `import requests

response = requests.post(
    'https://api.slidedesigner.com/v1/presentations',
    headers={
        'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
        'Content-Type': 'application/json',
    },
    json={
        'topic': 'AI in Healthcare',
        'slideCount': 10,
        'tone': 'formal',
    },
)

data = response.json()
print(data)`,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Code Examples</h3>
      </div>

      <div className="flex gap-2 mb-4">
        {(['curl', 'javascript', 'python'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedLang === lang
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
        <code>{examples[selectedLang]}</code>
      </pre>
    </div>
  );
}
