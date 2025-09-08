import { submitPortfolioItem } from '../actions';

export default function SubmitPortfolioPage({ searchParams }: { searchParams: { success?: string } }) {
  const success = searchParams.success === 'true';

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Soumettre un nouveau projet</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Merci ! </strong>
          <span className="block sm:inline">Votre projet a été soumis pour approbation.</span>
        </div>
      )}

      <form action={submitPortfolioItem} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre du Projet</label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            required
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL de l'image</label>
          <input
            type="url"
            name="imageUrl"
            id="imageUrl"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com/image.png"
          />
        </div>

        <div>
          <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700">URL du Projet</label>
          <input
            type="url"
            name="projectUrl"
            id="projectUrl"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://your-live-project.com"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Soumettre le Projet
          </button>
        </div>
      </form>
    </div>
  );
}
