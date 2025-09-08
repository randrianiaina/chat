'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const TipSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Here you could optionally verify the session with your backend
      // to prevent users from accessing this page directly.
      console.log('Successfully completed session:', sessionId);
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        {loading ? (
          <p>Verifying payment...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-green-500 mb-4">Tip Successful!</h1>
            <p className="mb-6">Thank you for your generosity. The user has received your tip.</p>
            <button 
              onClick={() => router.push('/chat')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Back to Chat
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TipSuccessPage;
