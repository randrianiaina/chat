import { db } from '@/lib/db';
import { portfolioItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';

export default async function PortfolioPage() {
  const approvedItems = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.status, 'approved'));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Notre Portfolio</h1>

      {approvedItems.length === 0 ? (
        <p className="text-center text-gray-500">Aucun projet approuvé pour le moment. Revenez bientôt !</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {approvedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
              <Link href={item.projectUrl || '#'} target="_blank" rel="noopener noreferrer">
                <div className="relative h-56 w-full">
                  <Image
                    src={item.imageUrl || 'https://via.placeholder.com/400x300?text=Project+Image'}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-700 text-sm">{item.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
