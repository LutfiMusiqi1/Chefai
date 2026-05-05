// app/dashboard/page.tsx
'use client';

import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions?: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  // Recipe CRUD states
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: ''
  });
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch recipes on component mount
  useEffect(() => {
    if (user) {
      fetchRecipes();
    }
  }, [user]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setRecipeError('Gabim gjatë ngarkimit të recetave');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gabim gjatë komunikimit me AI');
      }

      setResponse(data.reply);
    } catch (err: any) {
      setError(err.message || 'Gabim i papritur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.title.trim() || !newRecipe.ingredients.trim()) return;

    setIsSubmittingRecipe(true);
    setRecipeError('');

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user?.id,
          title: newRecipe.title,
          ingredients: newRecipe.ingredients,
          instructions: newRecipe.instructions
        }])
        .select();

      if (error) throw error;

      // Add new recipe to state
      if (data) {
        setRecipes([data[0], ...recipes]);
      }

      // Reset form
      setNewRecipe({ title: '', ingredients: '', instructions: '' });
    } catch (err: any) {
      console.error('Error creating recipe:', err);
      setRecipeError('Gabim gjatë ruajtjes së recetës');
    } finally {
      setIsSubmittingRecipe(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AI Chef Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Mirë se vini, {user.user_metadata?.full_name || user.email}!</h2>
            <p className="text-gray-600 mb-6">Pyetni AI-n tuaj për receta dhe këshilla kuzhine.</p>

            {/* AI Chat Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesazhi juaj
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Shkruani pyetjen tuaj këtu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Duke dërguar...
                  </>
                ) : (
                  'Dërgo'
                )}
              </button>
            </form>

            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                  <p className="text-blue-800">Duke pritur përgjigjen nga AI...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">Gabim:</p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* AI Response */}
            {response && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium">Përgjigja e AI:</p>
                <p className="text-green-700 mt-2 whitespace-pre-wrap">{response}</p>
              </div>
            )}

            {/* Recipe CRUD Section */}
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recetat e Mia</h3>

              {/* Add Recipe Form */}
              <form onSubmit={handleRecipeSubmit} className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Shto Recetë të Re</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Titulli
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Emri i recetës"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                      Përbërësit
                    </label>
                    <textarea
                      id="ingredients"
                      value={newRecipe.ingredients}
                      onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="Lista e përbërësve"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                      Udhëzimet (opsionale)
                    </label>
                    <textarea
                      id="instructions"
                      value={newRecipe.instructions}
                      onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Hapat për përgatitjen"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingRecipe}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmittingRecipe ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Duke ruajtur...
                      </>
                    ) : (
                      'Ruaj Recetën'
                    )}
                  </button>
                </div>
              </form>

              {/* Recipe Error */}
              {recipeError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">Gabim:</p>
                  <p className="text-red-700 mt-1">{recipeError}</p>
                </div>
              )}

              {/* Recipes List */}
              <div className="space-y-4">
                {recipes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nuk keni receta ende. Shtoni një të re!</p>
                ) : (
                  recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Përbërësit:</strong> {recipe.ingredients}
                      </div>
                      {recipe.instructions && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Udhëzimet:</strong> {recipe.instructions}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Krijuar më: {new Date(recipe.created_at).toLocaleDateString('sq-AL')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800"><strong>Email:</strong> {user.email}</p>
              <p className="text-blue-800 mt-1"><strong>User ID:</strong> {user.id}</p>
              <p className="text-blue-800 mt-1"><strong>I regjistruar më:</strong> {new Date(user.created_at).toLocaleDateString('sq-AL')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
