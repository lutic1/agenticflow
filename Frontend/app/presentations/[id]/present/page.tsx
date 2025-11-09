'use client';

import { use } from 'react';
import { LivePresentationMode } from '@/components/features/p1';
import { useRouter } from 'next/navigation';

export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleExit = () => {
    router.push(`/presentations/${id}/edit`);
  };

  return <LivePresentationMode presentationId={id} onExit={handleExit} />;
}
