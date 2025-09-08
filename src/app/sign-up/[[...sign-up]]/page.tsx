import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <SignUp />
    </div>
  );
}
