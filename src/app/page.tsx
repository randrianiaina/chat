import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to AI Chat</h1>
        <p className="text-lg text-gray-400 mb-8">
          The revolutionary new platform that lets you chat with cutting-edge AI models. Whether you need a creative partner, a technical expert, or just a friendly conversationalist, our AI has you covered.        </p>
        <SignedOut>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Get Started</h2>
            <p className="text-gray-400 mb-6">
              Sign in to start your first conversation. It's free!            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <p className="text-lg">You are signed in. Start chatting now!</p>
        </SignedIn>
      </div>
    </div>
  );
}
