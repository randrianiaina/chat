'use client';

import { useRouter } from 'next/navigation';

const TipCancelPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Tipping Canceled</h1>
        <p className="mb-6">The tipping process was canceled. You can always go back and try again.</p>
        <button 
          onClick={() => router.push('/chat')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Back to Chat
        </button>
      </div>
    </div>
  );
};

export default TipCancelPage;
