import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { portfolioItems } from '@/lib/db/schema';
import { updateItemStatus } from './actions';

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const isAdmin = user.publicMetadata.role === 'admin';

  if (!isAdmin) {
    return <p>Vous n'êtes pas autorisé à voir cette page.</p>;
  }

  const items = await db.select().from(portfolioItems);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panneau d'administration du Portfolio</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.status === 'pending'
                    ? 'bg-yellow-200 text-yellow-800'
                    : item.status === 'approved'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-4 flex space-x-2">
              <form action={async () => {
                'use server';
                await updateItemStatus(item.id, 'approved');
              }}>
                <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">
                  Approuver
                </button>
              </form>
              <form action={async () => {
                'use server';
                await updateItemStatus(item.id, 'rejected');
              }}>
                <button type="submit" className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Rejeter
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
