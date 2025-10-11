# SEO Implementation Guide

## Overview

This guide covers SEO implementation strategies for the Jahannuma platform, focusing on multilingual content, poetry metadata, and search engine optimization for Urdu and Hindi poetry.

## Table of Contents

1. [Meta Tags Strategy](#meta-tags-strategy)
2. [Multilingual SEO](#multilingual-seo)
3. [Poetry-Specific SEO](#poetry-specific-seo)
4. [Schema Markup](#schema-markup)
5. [URL Structure](#url-structure)
6. [Performance Optimization](#performance-optimization)
7. [Social Media Optimization](#social-media-optimization)

## Meta Tags Strategy

### Dynamic Meta Tags

All pages should implement dynamic meta tags based on content:

```typescript
// Example for poetry detail pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const poem = await getPoetryRecord(params.id);

  return {
    title: `${poem.title} - ${poem.poet} | Jahan Numa`,
    description: truncateText(poem.text, 160),
    keywords: [poem.poet, "urdu poetry", "ghazal", poem.category].join(", "),
    openGraph: {
      title: poem.title,
      description: truncateText(poem.text, 300),
      type: "article",
      url: `https://jahan-numa.org/ashaar/${params.id}`,
      images: [
        {
          url: `/api/og/poetry/${params.id}`,
          width: 1200,
          height: 630,
          alt: `${poem.title} by ${poem.poet}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: poem.title,
      description: truncateText(poem.text, 200),
    },
  };
}
```

### Page-Specific Meta Tags

- **Home Page**: Focus on site introduction and main keywords
- **Poetry Lists**: Include category, language, and pagination info
- **Poetry Details**: Include full poem metadata, poet info, and sharing tags
- **Poet Profiles**: Include biographical information and major works
- **Categories**: Include category descriptions and related keywords

## Multilingual SEO

### Language Detection and Switching

```typescript
// Implement proper hreflang tags
const generateHrefLangs = (currentPath: string) => ({
  "ur-PK": `https://jahan-numa.org/ur${currentPath}`,
  "hi-IN": `https://jahan-numa.org/hi${currentPath}`,
  "en-US": `https://jahan-numa.org/en${currentPath}`,
  "x-default": `https://jahan-numa.org${currentPath}`,
});
```

### Content Localization

- Translate meta descriptions and titles
- Use appropriate keywords for each language
- Implement proper content direction (RTL for Urdu/Arabic)
- Use language-specific social sharing messages

## Poetry-Specific SEO

### Keywords Strategy

Primary keywords by category:

- **Ghazal**: "غزل", "ghazal", "urdu ghazal", "hindi ghazal"
- **Nazm**: "نظم", "nazm", "urdu nazm", "poetry"
- **Rubai**: "رباعی", "rubai", "quatrain"
- **Shaer**: "شاعر", "poet", "urdu poet", "hindi poet"

### Content Optimization

1. **Title Optimization**:

   ```
   Format: [First Line] - [Poet Name] | [Category] | Jahan Numa
   Example: "دل سے دل تک - مرزا غالب | غزل | Jahan Numa"
   ```

2. **Description Optimization**:

   - Include first 2-3 lines of the poem
   - Add poet name and era
   - Include relevant keywords naturally

3. **Header Structure**:
   ```html
   <h1>Poetry Title</h1>
   <h2>By [Poet Name]</h2>
   <h3>Category: [Ghazal/Nazm/Rubai]</h3>
   ```

## Schema Markup

### CreativeWork Schema for Poetry

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Poetry Title",
  "author": {
    "@type": "Person",
    "name": "Poet Name"
  },
  "dateCreated": "Historical Date",
  "inLanguage": "ur",
  "genre": "Poetry",
  "keywords": ["urdu poetry", "ghazal", "poet name"],
  "text": "Full poem text...",
  "publisher": {
    "@type": "Organization",
    "name": "Jahan Numa"
  }
}
```

### Person Schema for Poets

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Poet Name",
  "birthDate": "Birth Year",
  "deathDate": "Death Year",
  "nationality": "Pakistani/Indian",
  "occupation": "Poet",
  "knowsLanguage": ["Urdu", "Persian", "Arabic"],
  "sameAs": ["https://en.wikipedia.org/wiki/Poet_Name"]
}
```

## URL Structure

### SEO-Friendly URLs

```
✅ Good:
/ashaar/mirza-ghalib/dil-se-dil-tak
/ghazlen/allama-iqbal/shikwa
/poets/mirza-ghalib

❌ Avoid:
/poetry?id=123&type=ghazal
/content/view/456
```

### URL Parameters

- Use hyphens for separation
- Include transliterated titles
- Keep URLs under 60 characters when possible
- Implement proper canonical URLs

## Performance Optimization

### Core Web Vitals

1. **Largest Contentful Paint (LCP)**:

   - Optimize hero images
   - Use efficient text rendering
   - Implement proper font loading

2. **First Input Delay (FID)**:

   - Minimize JavaScript execution
   - Use code splitting
   - Implement proper event handling

3. **Cumulative Layout Shift (CLS)**:
   - Reserve space for dynamic content
   - Use stable layouts
   - Optimize font loading

### Image Optimization

```typescript
// Next.js Image component optimization
<Image
  src={poetImage}
  alt={`${poet.name} - ${poet.description}`}
  width={400}
  height={400}
  priority={isAboveFold}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Social Media Optimization

### Open Graph Tags

```html
<meta property="og:title" content="Poetry Title - Poet Name" />
<meta property="og:description" content="First few lines of poetry..." />
<meta property="og:image" content="/api/og/poetry/[id]" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="ur_PK" />
<meta property="og:locale:alternate" content="hi_IN" />
<meta property="og:locale:alternate" content="en_US" />
```

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Poetry Title" />
<meta name="twitter:description" content="Poetry excerpt..." />
<meta name="twitter:image" content="/api/og/poetry/[id]" />
```

### Dynamic OG Image Generation

Create API routes for dynamic Open Graph images:

```typescript
// app/api/og/poetry/[id]/route.tsx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const poetry = await getPoetryRecord(id);

  return new ImageResponse(
    (
      <div
        style={
          {
            /* styling */
          }
        }
      >
        <h1>{poetry.title}</h1>
        <p>{poetry.poet}</p>
        <div>{truncateText(poetry.text, 100)}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

## Implementation Checklist

### Basic SEO

- [ ] Dynamic title tags for all pages
- [ ] Meta descriptions under 160 characters
- [ ] Proper header hierarchy (H1-H6)
- [ ] Alt text for all images
- [ ] Canonical URLs implemented

### Technical SEO

- [ ] XML sitemap generation
- [ ] Robots.txt configuration
- [ ] 404 error handling
- [ ] Redirect management
- [ ] Page speed optimization

### Content SEO

- [ ] Keyword research completed
- [ ] Content structure optimized
- [ ] Internal linking strategy
- [ ] External link validation
- [ ] Multilingual content optimization

### Advanced SEO

- [ ] Schema markup implementation
- [ ] Core Web Vitals optimization
- [ ] Mobile-first indexing
- [ ] Social media integration
- [ ] Analytics and monitoring setup

## Monitoring and Analytics

### Key Metrics to Track

1. **Organic Traffic**: Monitor growth in poetry-related searches
2. **Keyword Rankings**: Track positions for target keywords
3. **Core Web Vitals**: Ensure optimal user experience
4. **Click-Through Rates**: Optimize meta tags based on CTR
5. **Social Shares**: Monitor social media engagement

### Tools and Resources

- Google Search Console
- Google Analytics 4
- Core Web Vitals monitoring
- Schema markup validator
- Social media sharing debuggers

### Regular Maintenance

- Monthly keyword performance review
- Quarterly technical SEO audit
- Bi-annual content optimization
- Annual strategy review and updates
