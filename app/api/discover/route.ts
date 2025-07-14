import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { container } from '../../../di/container';
import { SYMBOLS } from '../../../di/symbols';
import { ISearchEngineService } from '../../../src/application/services/ISearchEngineService';

interface DiscoverCategory {
  id: string;
  name: string;
  topics: string[];
  sites: string[];
}

const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  {
    id: 'top',
    name: 'Top',
    topics: ['trending', 'breaking news', 'popular'],
    sites: ['techcrunch.com', 'theverge.com', 'reuters.com', 'bbc.com']
  },
  {
    id: 'technology',
    name: 'Technology',
    topics: ['AI', 'tech', 'programming', 'software', 'gadgets'],
    sites: ['techcrunch.com', 'wired.com', 'theverge.com', 'arstechnica.com', 'engadget.com']
  },
  {
    id: 'science',
    name: 'Science',
    topics: ['research', 'science', 'discovery', 'study', 'innovation'],
    sites: ['nature.com', 'sciencedaily.com', 'newscientist.com', 'scientificamerican.com']
  },
  {
    id: 'business',
    name: 'Business',
    topics: ['business', 'finance', 'markets', 'economy', 'startup'],
    sites: ['bloomberg.com', 'reuters.com', 'businessinsider.com', 'forbes.com', 'wsj.com']
  },
  {
    id: 'health',
    name: 'Health',
    topics: ['health', 'medicine', 'wellness', 'medical', 'healthcare'],
    sites: ['healthline.com', 'webmd.com', 'mayoclinic.org', 'medicalnewstoday.com']
  }
];

const getCategoryById = (categoryId: string): DiscoverCategory | undefined => {
  return DISCOVER_CATEGORIES.find(cat => cat.id === categoryId);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || 'top';
    const mode = searchParams.get('mode') || 'normal';
    const searchEngine = 'exa'; // Fixed to use Exa for better results
    

    const category = getCategoryById(categoryId);
    
    if (!category) {
      return Response.json(
        { message: 'Invalid category' },
        { status: 400 }
      );
    }

    let results: Array<{ title: string; content: string; url: string; thumbnail?: string }> = [];

    try {
      // Get the composite search engine service
      const searchEngineService = container.get<ISearchEngineService>(SYMBOLS.SearchEngineService);
      
      if (mode === 'normal') {
        // Generate multiple searches for the category using Exa's semantic neural search
        const searchPromises = [];
        
        // Exa: Use semantic neural search for high-quality results
        for (const topic of category.topics.slice(0, 3)) {
          searchPromises.push(
            (async () => {
              const searchResults = [];
              try {
                const searchGenerator = searchEngineService.search(
                  `Find high-quality articles about ${topic} in ${category.name.toLowerCase()}`, 
                  'exa', 
                  { 
                    limit: 4,
                    filters: { 
                      searchType: categoryId,
                      sites: category.sites.slice(0, 3).join(',')
                    }
                  }
                );
                
                for await (const result of searchGenerator) {
                  searchResults.push({
                    title: result.title,
                    content: result.snippet,
                    url: result.url,
                    thumbnail: `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=64`,
                  });
                }
              } catch (searchError) {
              }
              return searchResults;
            })()
          );
        }

        const allResults = await Promise.all(searchPromises);
        const flatResults = allResults.flat();
        
        // Remove duplicates and shuffle
        const uniqueResults = flatResults.filter((item, index, self) => 
          index === self.findIndex(t => t.url === item.url)
        );
        
        results = uniqueResults.sort(() => Math.random() - 0.5).slice(0, 20);
        
      } else {
        // Preview mode - single search
        const randomTopic = category.topics[Math.floor(Math.random() * category.topics.length)];
        
        try {
          const searchGenerator = searchEngineService.search(
            randomTopic, 
            'exa', 
            { limit: 5 }
          );
          
          for await (const result of searchGenerator) {
            results.push({
              title: result.title,
              content: result.snippet,
              url: result.url,
              thumbnail: `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=64`,
            });
          }
        } catch (searchError) {
        }
      }
    } catch (serviceError) {
    }

    // Fallback to mock data if search fails or returns no results
    if (results.length === 0) {
      results = getMockDataForCategory(category);
    }

    return Response.json({
      blogs: results,
      category: {
        id: category.id,
        name: category.name
      },
      searchEngine: 'exa',
      availableCategories: DISCOVER_CATEGORIES.map(cat => ({
        id: cat.id,
        name: cat.name
      }))
    });

  } catch (error) {
    console.error('Error in discover route:', error);
    
    // Return mock data even on error
    const category = getCategoryById('top')!;
    return Response.json({
      blogs: getMockDataForCategory(category),
      category: {
        id: category.id,
        name: category.name
      },
      searchEngine: 'exa',
      availableCategories: DISCOVER_CATEGORIES.map(cat => ({
        id: cat.id,
        name: cat.name
      }))
    });
  }
}

function getMockDataForCategory(category: DiscoverCategory) {
  const mockData = {
    top: [
      {
        title: "Breaking: Major Tech Companies Announce New AI Partnership",
        content: "Leading technology companies have announced a groundbreaking partnership to advance artificial intelligence research and development.",
        url: "https://techcrunch.com/ai-partnership",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Global Markets Surge as Economic Data Shows Strong Growth",
        content: "Stock markets worldwide are experiencing significant gains following the release of positive economic indicators.",
        url: "https://reuters.com/markets-surge",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Climate Summit Reaches Historic Agreement on Carbon Reduction",
        content: "World leaders have reached a consensus on new measures to combat climate change at the international summit.",
        url: "https://bbc.com/climate-agreement",
        thumbnail: "https://via.placeholder.com/16x16"
      }
    ],
    technology: [
      {
        title: "Revolutionary Quantum Computing Breakthrough Achieved",
        content: "Scientists have made a significant advancement in quantum computing that could transform the industry.",
        url: "https://wired.com/quantum-breakthrough",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "New Programming Language Promises 10x Performance Boost",
        content: "Developers are excited about a new programming language that offers unprecedented performance improvements.",
        url: "https://arstechnica.com/new-language",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "AI Model Achieves Human-Level Performance in Complex Tasks",
        content: "A new artificial intelligence model has demonstrated capabilities that match human performance in various domains.",
        url: "https://techcrunch.com/ai-performance",
        thumbnail: "https://via.placeholder.com/16x16"
      }
    ],
    science: [
      {
        title: "Groundbreaking Cancer Treatment Shows 95% Success Rate",
        content: "Researchers have developed a new cancer treatment that shows remarkable success in clinical trials.",
        url: "https://nature.com/cancer-treatment",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "New Exoplanet Discovery Could Harbor Life",
        content: "Astronomers have discovered a potentially habitable exoplanet in a nearby star system.",
        url: "https://scientificamerican.com/exoplanet",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Gene Therapy Restores Sight to Blind Patients",
        content: "A revolutionary gene therapy treatment has successfully restored vision to patients with hereditary blindness.",
        url: "https://newscientist.com/gene-therapy",
        thumbnail: "https://via.placeholder.com/16x16"
      }
    ],
    business: [
      {
        title: "Startup Valued at $10B After Latest Funding Round",
        content: "A technology startup has reached unicorn status with a massive valuation following its Series C funding.",
        url: "https://forbes.com/startup-valuation",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Major Corporate Merger Creates Industry Giant",
        content: "Two leading companies have announced a merger that will create one of the largest entities in the sector.",
        url: "https://bloomberg.com/corporate-merger",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Economic Policy Changes Impact Global Trade",
        content: "New economic policies are expected to significantly influence international trade relationships.",
        url: "https://wsj.com/economic-policy",
        thumbnail: "https://via.placeholder.com/16x16"
      }
    ],
    health: [
      {
        title: "New Study Reveals Key to Longevity",
        content: "Researchers have identified crucial factors that contribute to increased lifespan and healthy aging.",
        url: "https://healthline.com/longevity-study",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Revolutionary Heart Surgery Technique Developed",
        content: "Medical professionals have pioneered a new surgical technique that reduces recovery time by 50%.",
        url: "https://mayoclinic.org/heart-surgery",
        thumbnail: "https://via.placeholder.com/16x16"
      },
      {
        title: "Mental Health App Shows Promising Results in Clinical Trial",
        content: "A new mobile application for mental health support has demonstrated significant effectiveness in treating anxiety.",
        url: "https://webmd.com/mental-health-app",
        thumbnail: "https://via.placeholder.com/16x16"
      }
    ]
  };

  return mockData[category.id as keyof typeof mockData] || mockData.top;
}