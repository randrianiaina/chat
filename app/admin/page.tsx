import { auth, currentUser } from "@clerk/nextjs/server";

// IMPORTANT: This secret should be stored in environment variables
const adminApiSecret = process.env.SET_ADMIN_SECRET || "pE7zQ9rA3sWbVcFgLp2jKhGfN6mUvXyZ";

async function AdminPage() {
  const { userId } = auth();
  const user = await currentUser();

  // This page is only for the intended user to become an admin
  if (userId !== "user_32PPMegYVHSX2WNaG0qT8vQgquh") {
    return <div className="p-8">Access Denied.</div>;
  }

  async function makeAdminAction() {
    "use server";
    const { userId } = auth();
    if (userId !== "user_32PPMegYVHSX2WNaG0qT8vQgquh") {
      return { success: false, message: "Unauthorized." };
    }

    try {
      const response = await fetch("http://localhost:3000/api/set-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: userId,
          role: "admin",
          secret: adminApiSecret
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set admin role.");
      }

      const result = await response.json();
      console.log("Role set successfully:", result.message);
      return { success: true, message: result.message };

    } catch (error: any) {
      console.error("Error in server action:", error);
      return { success: false, message: error.message || "An unknown error occurred." };
    }
  }

  const isAlreadyAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Admin Control Panel</h1>
        <p className="text-center text-gray-600 mb-6">Welcome, {user?.firstName || userId}.</p>
        {
          isAlreadyAdmin ? (
            <p className="text-center text-green-600 font-semibold">You are already an administrator.</p>
          ) : (
            <form action={makeAdminAction}>
              <p className="text-center text-gray-600 mb-4">Click the button below to grant yourself administrator privileges.</p>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              >
                Make Me Admin
              </button>
            </form>
          )
        }
      </div>
    </div>
  );
}

export default AdminPage;
