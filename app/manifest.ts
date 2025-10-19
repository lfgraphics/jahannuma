import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JahanNuma - Urdu Poetry Collection',
    short_name: 'JahanNuma',
    description: 'A Beautiful Collection of Urdu, English and Hindi Poets introduction and their Prose, Poetries, Ebooks, interviews etc.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#F0D586',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'ur',
    categories: ['education', 'books', 'entertainment', 'lifestyle'],

    icons: [
      {
        src: '/favicon/android-icon-36x36.png',
        sizes: '36x36',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon/android-icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon/android-icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon/android-icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon/android-icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/favicon/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '6180x6180',
        type: 'image/png',
        purpose: 'any'
      }
    ],

    screenshots: [
      {
        src: '/screenshots/home.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'wide',
        label: 'JahanNuma Home Page'
      },
      {
        src: '/screenshots/books.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'wide',
        label: 'E-Books Collection'
      },
      {
        src: '/screenshots/shura.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'wide',
        label: 'Poetry Council View'
      },
      {
        src: '/screenshots/languages.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'narrow',
        label: 'Multi-language Support'
      },
      {
        src: '/screenshots/dark_theme.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'narrow',
        label: 'Dark Theme Interface'
      },
      {
        src: '/screenshots/download.jpg',
        sizes: '1280x720',
        type: 'image/jpg',
        form_factor: 'narrow',
        label: 'Download Feature'
      },
      {
        src: '/screenshots/desktop_home.jpg',
        sizes: '390x844',
        type: 'image/jpg',
        form_factor: 'wide',
        label: 'Home Page'
      }
    ],

    shortcuts: [
      {
        name: 'Poetry',
        short_name: 'Ashaar',
        description: 'Read Urdu poetry',
        url: '/Ashaar',
        icons: [
          {
            src: '/icons/ashaar.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Ghazals',
        short_name: 'Ghazals',
        description: 'Explore Ghazals',
        url: '/Ghazlen',
        icons: [
          {
            src: '/icons/ghazlen.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'E-Books',
        short_name: 'Books',
        description: 'Read digital books',
        url: '/E-Books',
        icons: [
          {
            src: '/icons/books.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],

    // related_applications: [],
    // prefer_related_applications: false,
  }
}