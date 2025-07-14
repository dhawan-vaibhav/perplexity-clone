'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useBackground } from '../../contexts/BackgroundContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

interface Discover {
  title: string;
  content: string;
  url: string;
  thumbnail: string;
}

interface Category {
  id: string;
  name: string;
}

interface DiscoverResponse {
  blogs: Discover[];
  category: Category;
  availableCategories: Category[];
  searchEngine: string;
}

export default function DiscoverPage() {
  const { session } = useSession();
  const { setShowGridBackground } = useBackground();
  const [discoverData, setDiscoverData] = useState<Record<string, Discover[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('top');
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());

  // Turn off grid background when on discover page
  useEffect(() => {
    setShowGridBackground(false);
  }, [setShowGridBackground]);

  // Create session-based cache key
  const getCacheKey = (type: 'data' | 'categories') => {
    if (!session?.id) return null;
    return `discover-${type}-${session.id}`;
  };

  const fetchCategoryData = async (categoryId: string) => {
    try {
      // Check if already cached
      const dataKey = getCacheKey('data');
      if (dataKey) {
        const cachedData = sessionStorage.getItem(dataKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData[categoryId]) {
            return parsedData[categoryId];
          }
        }
      }

      
      const res = await fetch(`/api/discover?category=${categoryId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data: DiscoverResponse = await res.json();
      if (!res.ok) {
        throw new Error(`Failed to fetch data for category: ${categoryId}`);
      }
      
      // Update cache
      if (dataKey) {
        const cachedData = sessionStorage.getItem(dataKey);
        const allData = cachedData ? JSON.parse(cachedData) : {};
        allData[categoryId] = data.blogs;
        sessionStorage.setItem(dataKey, JSON.stringify(allData));
      }
      
      return data.blogs;
    } catch (error) {
      console.error(`Error fetching data for category ${categoryId}:`, error);
      return [];
    }
  };

  const initializeTopCategory = async () => {
    try {
      setLoading(true);
      
      // Check for cached data first
      const dataKey = getCacheKey('data');
      const categoriesKey = getCacheKey('categories');
      
      if (dataKey && categoriesKey) {
        const cachedData = sessionStorage.getItem(dataKey);
        const cachedCategories = sessionStorage.getItem(categoriesKey);
        
        if (cachedData && cachedCategories) {
          const parsedData = JSON.parse(cachedData);
          const parsedCategories = JSON.parse(cachedCategories);
          
          // Only load cached data if we have the top category
          if (parsedData.top) {
            setDiscoverData(parsedData);
            setCategories(parsedCategories);
            setHasLoadedData(true);
            setLoading(false);
            return;
          }
        }
      }
      
      
      // Fetch top category and available categories
      const res = await fetch(`/api/discover?category=top`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const data: DiscoverResponse = await res.json();
      
      setCategories(data.availableCategories);
      setDiscoverData({ top: data.blogs });
      setHasLoadedData(true);
      
      // Cache the categories and initial data
      if (dataKey && categoriesKey) {
        sessionStorage.setItem(dataKey, JSON.stringify({ top: data.blogs }));
        sessionStorage.setItem(categoriesKey, JSON.stringify(data.availableCategories));
      }
    } catch (error) {
      console.error('Error initializing discover page:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoadedData && session?.id) {
      initializeTopCategory();
    }
  }, [hasLoadedData, session?.id]);

  const handleCategoryChange = async (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Check if we already have data for this category
    if (discoverData[categoryId]) {
      return; // Data already loaded
    }
    
    // Add to loading state
    setLoadingCategories(prev => new Set(prev).add(categoryId));
    
    try {
      // Fetch data for this category
      const categoryData = await fetchCategoryData(categoryId);
      setDiscoverData(prev => ({
        ...prev,
        [categoryId]: categoryData
      }));
    } finally {
      // Remove from loading state
      setLoadingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  const renderDiscoverContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const currentData = discoverData[activeCategory];
    
    if (!currentData || currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No articles found for this category.</p>
        </div>
      );
    }

    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
        {currentData.map((item, i) => (
          <Link
            href={item.url}
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Thumbnail/Preview Section */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
              <img
                className="w-16 h-16 object-contain"
                src={item.thumbnail}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-icon w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg';
                    fallback.innerHTML = `
                      <svg class="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                    `;
                    parent.appendChild(fallback);
                  }
                }}
              />
              
              {/* Domain badge */}
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                {new URL(item.url).hostname.replace('www.', '')}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {item.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Image
          src="/discover-icon.svg"
          alt="Discover"
          width={24}
          height={24}
          className="mr-2"
        />
        <h1 className="text-3xl font-bold">Discover</h1>
      </div>
      
      {/* Tabs Navigation */}
      <Tabs 
        value={activeCategory} 
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none h-auto p-0">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="relative px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-transparent border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:border-gray-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent transition-all duration-200 rounded-none"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Tab Content */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            {loadingCategories.has(category.id) ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full opacity-50"></div>
              </div>
            ) : (
              renderDiscoverContent()
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}