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
  const [charCount, setCharCount] = useState(0);
  const MESSAGE_MAX_LENGTH = 1000;
  const MESSAGE_MIN_LENGTH = 5;

  // Recipe CRUD states
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: ''
  });
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState('');
  const [recipeCharCounts, setRecipeCharCounts] = useState({ title: 0, ingredients: 0 });
  const RECIPE_TITLE_MAX = 100;
  const RECIPE_INGREDIENTS_MAX = 1000;

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
    setIsLoadingRecipes(true);
    setRecipeError('');
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Check for auth errors (expired session)
        if (error.message?.includes('JWT') || error.message?.includes('unauthorized')) {
          setRecipeError('Sesioni juaj ka skaduar. Ju lutem kyçuni përново.');
          signOut();
          return;
        }
        throw error;
      }
      setRecipes(data || []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      // Network error or server error
      if (!navigator.onLine) {
        setRecipeError('Nuk këta koneksion internet. Kontrolloni lidhjen tuaj.');
      } else if (err.message?.includes('fetch')) {
        setRecipeError('Gabim të lidhjeve. Provo më vonë.');
      } else {
        setRecipeError('Gabim gjatë ngarkimit të recetave. Provo të ringarkosh faqen.');
      }
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Edge case 1: Empty input validation
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError('Ju lutem shkruani diçka para se të dërgoni.');
      return;
    }

    // Edge case 2: Minimum length check
    if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
      setError(`Mesazhi duhet të ketë të paktën ${MESSAGE_MIN_LENGTH} karaktere.`);
      return;
    }

    // Edge case 3: Maximum length check
    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      setError(`Mesazhi nuk mund të jetë më i madh se ${MESSAGE_MAX_LENGTH} karaktere.`);
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      // Edge case 4: Network connection check
      if (!navigator.onLine) {
        throw new Error('Nuk këta koneksion internet. Kontrolloni lidhjen tuaj.');
      }

      // Set timeout for API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Edge case 5: Check for expired session
      if (res.status === 401) {
        setError('Sesioni juaj ka skaduar. Ju lutem kyçuni përново.');
        signOut();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        // Edge case 6: API-specific errors
        if (res.status === 429) {
          throw new Error('Shumë kërkesa. Rritni përpjekjet në disa sekonda.');
        }
        if (res.status === 503) {
          throw new Error('Shërbimi AI nuk është i disponueshëm. Provo më vonë.');
        }
        throw new Error(data.error || 'Gabim gjatë komunikimit me AI');
      }

      setResponse(data.reply);
      setMessage(''); // Clear input on success
    } catch (err: any) {
      // Edge case 7: Handle different types of errors
      if (err.name === 'AbortError') {
        setError('Kërkesa zgjati shumë. Provo përsëri me mesazh më të shkurtër.');
      } else if (err.message?.includes('Failed to fetch')) {
        setError('Gabim të lidhjeve. Kontrolloni internetin ose provo përsëri.');
      } else {
        setError(err.message || 'Gabim i papritur. Provo më vonë.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Edge case 1: Empty input validation
    const trimmedTitle = newRecipe.title.trim();
    const trimmedIngredients = newRecipe.ingredients.trim();

    if (!trimmedTitle || !trimmedIngredients) {
      setRecipeError('Titulli dhe përbërësit janë të detyrueshëm.');
      return;
    }

    // Edge case 2: Length validation
    if (trimmedTitle.length > RECIPE_TITLE_MAX) {
      setRecipeError(`Titulli nuk mund të jetë më i madh se ${RECIPE_TITLE_MAX} karaktere.`);
      return;
    }

    if (trimmedIngredients.length > RECIPE_INGREDIENTS_MAX) {
      setRecipeError(`Përbërësit nuk mund të jenë më i madh se ${RECIPE_INGREDIENTS_MAX} karaktere.`);
      return;
    }

    // Edge case 3: Prevent double submit
    if (isSubmittingRecipe) {
      return;
    }

    setIsSubmittingRecipe(true);
    setRecipeError('');

    try {
      // Edge case 4: Network check
      if (!navigator.onLine) {
        throw new Error('Nuk këta koneksion internet.');
      }

      // Check if user is still authenticated
      if (!user?.id) {
        throw new Error('Nuk mund të identifikoheni. Kyçuni përsëri.');
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          title: trimmedTitle,
          ingredients: trimmedIngredients,
          instructions: newRecipe.instructions.trim() || null
        }])
        .select();

      // Edge case 5: Handle auth errors
      if (error?.message?.includes('JWT') || error?.message?.includes('unauthorized')) {
        setRecipeError('Sesioni juaj ka skaduar. Kyçuni përsëri.');
        signOut();
        return;
      }

      if (error) throw error;

      // Add new recipe to state
      if (data && data.length > 0) {
        setRecipes([data[0], ...recipes]);
        // Reset form on success
        setNewRecipe({ title: '', ingredients: '', instructions: '' });
        setRecipeCharCounts({ title: 0, ingredients: 0 });
      }
    } catch (err: any) {
      console.error('Error creating recipe:', err);
      if (!navigator.onLine) {
        setRecipeError('Nuk këta koneksion internet. Provo përsëri.');
      } else if (err.message?.includes('unique')) {
        setRecipeError('Keni tashmë një recetë me këtë emër.');
      } else {
        setRecipeError(err.message || 'Gabim gjatë ruajtjes. Provo përsëri.');
      }
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
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mesazhi juaj
                  </label>
                  <span className={`text-sm ${charCount > MESSAGE_MAX_LENGTH ? 'text-red-600' : charCount > MESSAGE_MAX_LENGTH * 0.9 ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {charCount} / {MESSAGE_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                  placeholder="Shkruani pyetjen tuaj këtu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={isLoading}
                  maxLength={MESSAGE_MAX_LENGTH}
                />
                <p className="text-xs text-gray-500 mt-1">Minimale {MESSAGE_MIN_LENGTH} karaktere</p>
              </div>
              <button
                type="submit"
                disabled={isLoading || !message.trim() || charCount < MESSAGE_MIN_LENGTH || charCount > MESSAGE_MAX_LENGTH}
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
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Titulli
                      </label>
                      <span className={`text-sm ${recipeCharCounts.title > RECIPE_TITLE_MAX ? 'text-red-600' : 'text-gray-500'}`}>
                        {recipeCharCounts.title} / {RECIPE_TITLE_MAX}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="title"
                      value={newRecipe.title}
                      onChange={(e) => {
                        setNewRecipe({...newRecipe, title: e.target.value});
                        setRecipeCharCounts({...recipeCharCounts, title: e.target.value.length});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Emri i recetës"
                      maxLength={RECIPE_TITLE_MAX}
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                        Përbërësit
                      </label>
                      <span className={`text-sm ${recipeCharCounts.ingredients > RECIPE_INGREDIENTS_MAX ? 'text-red-600' : recipeCharCounts.ingredients > RECIPE_INGREDIENTS_MAX * 0.9 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {recipeCharCounts.ingredients} / {RECIPE_INGREDIENTS_MAX}
                      </span>
                    </div>
                    <textarea
                      id="ingredients"
                      value={newRecipe.ingredients}
                      onChange={(e) => {
                        setNewRecipe({...newRecipe, ingredients: e.target.value});
                        setRecipeCharCounts({...recipeCharCounts, ingredients: e.target.value.length});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="Lista e përbërësve"
                      maxLength={RECIPE_INGREDIENTS_MAX}
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
                  {!navigator.onLine && (
                    <p className="text-red-600 text-sm mt-2">💡 Kontrolloni lidhjen tuaj të internetit</p>
                  )}
                </div>
              )}

              {/* Recipes Loading State */}
              {isLoadingRecipes && (
                <div className="p-4 bg-blue-50 rounded-md text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                    <p className="text-blue-800">Duke ngarkuar recetat...</p>
                  </div>
                </div>
              )}

              {/* Recipes List */}
              {!isLoadingRecipes && (
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
              )}
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
