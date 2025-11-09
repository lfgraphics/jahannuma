import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.jahan-numa.org' // Replace with your actual domain

  // Define all the main routes from your app directory
  const routes = [
    '',
    // '/About_site',
    '/Ashaar',
    '/Ashaar/mozu',
    '/Ashaar/shaer',
    '/bazmehindi',
    '/bazmeurdu',
    '/Blogs',
    '/cancellation%26refund', // URL encoded for proper XML
    '/Contact',
    '/donate',
    '/E-Books',
    '/Favorites',
    '/Founders',
    '/Ghazlen',
    '/Ghazlen/mozu',
    '/Ghazlen/shaer',
    '/Interview',
    '/Nazmen',
    '/Nazmen/shaer',
    '/privacypolicy',
    '/Programs',
    '/Rubai',
    '/Rubai/shaer',
    '/Shaer',
    '/shipping%26delivery', // URL encoded for proper XML
    '/sign-in',
    '/sign-up',
    '/terms%26conditions' // URL encoded for proper XML
  ]

  // Languages supported
  const languages = [
    { code: '', path: '' }, // Default (Urdu)
    { code: 'en', path: '/EN' }, // English
    { code: 'hi', path: '/HI' } // Hindi
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // Generate sitemap entries for each route in each language
  languages.forEach(lang => {
    routes.forEach(route => {
      const url = `${baseUrl}${lang.path}${route}`

      // Create alternates object for multilingual SEO
      const alternates: { [key: string]: string } = {}
      languages.forEach(altLang => {
        const langCode = altLang.code || 'ur' // Default to Urdu
        alternates[langCode] = `${baseUrl}${altLang.path}${route}`
      })

      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: getChangeFrequency(route),
        priority: getPriority(route),
        alternates: {
          languages: alternates
        }
      })
    })
  })

  return sitemap
}

// Helper function to determine change frequency based on route type
function getChangeFrequency(route: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  if (route === '') return 'daily' // Homepage
  if (route.includes('/Blogs') || route.includes('/Interview')) return 'weekly'
  if (route.includes('/Ashaar') || route.includes('/Ghazlen') || route.includes('/Nazmen') || route.includes('/Rubai')) return 'daily'
  if (route.includes('/E-Books') || route.includes('/Programs')) return 'monthly'
  if (route.includes('policy') || route.includes('terms') || route.includes('refund') || route.includes('delivery')) return 'yearly'
  if (route.includes('/Contact') || route.includes('/About_site')) return 'monthly'
  return 'monthly'
}

// Helper function to determine priority based on route importance
function getPriority(route: string): number {
  if (route === '') return 1.0 // Homepage
  if (route.includes('/Ashaar') || route.includes('/Ghazlen') || route.includes('/Nazmen') || route.includes('/Rubai')) return 0.9
  if (route.includes('/About_site') || route.includes('/Contact')) return 0.8
  if (route.includes('/E-Books') || route.includes('/Shaer')) return 0.7
  if (route.includes('/Blogs') || route.includes('/Interview') || route.includes('/Programs')) return 0.6
  if (route.includes('/donate') || route.includes('/Favorites')) return 0.5
  if (route.includes('policy') || route.includes('terms') || route.includes('refund') || route.includes('delivery')) return 0.3
  if (route.includes('/sign-')) return 0.4
  return 0.5
}