# Component Development Guidelines

## Overview

This document provides comprehensive guidelines for developing, maintaining, and contributing to components in the Jahannuma platform. It covers coding standards, design patterns, testing requirements, and best practices.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Coding Standards](#coding-standards)
3. [Design Patterns](#design-patterns)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [Styling Guidelines](#styling-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility Standards](#accessibility-standards)
9. [Internationalization](#internationalization)
10. [Documentation Requirements](#documentation-requirements)

## Component Architecture

### Directory Structure

```
components/
├── ui/                     # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── common/                 # Shared application components
│   ├── Header/
│   │   ├── index.tsx      # Main component
│   │   ├── Header.types.ts # Type definitions
│   │   ├── Header.test.tsx # Tests
│   │   └── README.md      # Component documentation
│   └── ...
├── feature/               # Feature-specific components
│   ├── Poetry/
│   │   ├── PoetryCard/
│   │   ├── PoetryList/
│   │   └── PoetryDetails/
│   └── ...
└── layout/               # Layout components
    ├── PageLayout/
    ├── ContentLayout/
    └── ...
```

### Component Hierarchy

1. **Base Components** (`ui/`): Primitive, reusable UI elements
2. **Common Components** (`common/`): Shared business logic components
3. **Feature Components** (`feature/`): Domain-specific components
4. **Layout Components** (`layout/`): Page structure components

### File Naming Conventions

- **Components**: PascalCase (`PoetryCard.tsx`)
- **Types**: PascalCase with `.types.ts` suffix (`PoetryCard.types.ts`)
- **Tests**: Same as component with `.test.tsx` suffix (`PoetryCard.test.tsx`)
- **Styles**: Same as component with `.module.css` suffix (`PoetryCard.module.css`)

## Coding Standards

### Component Declaration

Use function declarations for components:

```tsx
// ✅ Preferred
function PoetryCard({ title, poet, content }: PoetryCardProps) {
  return (
    <article className="poetry-card">
      <h3>{title}</h3>
      <p className="poet">{poet}</p>
      <div className="content">{content}</div>
    </article>
  );
}

// ❌ Avoid
const PoetryCard: React.FC<PoetryCardProps> = ({ title, poet, content }) => {
  // ...
};
```

### Props Interface

Always define props interfaces:

```tsx
interface PoetryCardProps {
  title: string;
  poet: string;
  content: string;
  language?: "ur" | "hi" | "en";
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
  children?: React.ReactNode;
}
```

### Default Props

Use default parameters instead of defaultProps:

```tsx
// ✅ Preferred
function PoetryCard({
  title,
  poet,
  content,
  language = "ur",
  className = "",
}: PoetryCardProps) {
  // ...
}

// ❌ Avoid
PoetryCard.defaultProps = {
  language: "ur",
  className: "",
};
```

### Export Pattern

Use named exports with default export:

```tsx
// PoetryCard/index.tsx
export { default } from "./PoetryCard";
export type { PoetryCardProps } from "./PoetryCard.types";

// PoetryCard/PoetryCard.tsx
function PoetryCard(props: PoetryCardProps) {
  // Implementation
}

export default PoetryCard;
```

## Design Patterns

### Compound Components

For complex components with multiple sub-components:

```tsx
// Poetry.tsx
function Poetry({ children }: { children: React.ReactNode }) {
  return <article className="poetry">{children}</article>;
}

function PoetryTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="poetry-title">{children}</h1>;
}

function PoetryContent({ children }: { children: React.ReactNode }) {
  return <div className="poetry-content">{children}</div>;
}

// Compound pattern
Poetry.Title = PoetryTitle;
Poetry.Content = PoetryContent;

export default Poetry;

// Usage
<Poetry>
  <Poetry.Title>غزل کا عنوان</Poetry.Title>
  <Poetry.Content>غزل کا متن...</Poetry.Content>
</Poetry>;
```

### Render Props Pattern

For flexible, reusable logic:

```tsx
interface PoetryDataProps {
  poetryId: string;
  children: (data: {
    poetry: Poetry | null;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

function PoetryData({ poetryId, children }: PoetryDataProps) {
  const { data: poetry, isLoading, error } = usePoetry(poetryId);

  return children({
    poetry,
    loading: isLoading,
    error: error?.message || null,
  });
}

// Usage
<PoetryData poetryId="rec123">
  {({ poetry, loading, error }) => {
    if (loading) return <Loader />;
    if (error) return <ErrorMessage error={error} />;
    if (!poetry) return <NotFound />;

    return <PoetryCard {...poetry} />;
  }}
</PoetryData>;
```

### Custom Hooks Pattern

Extract component logic into custom hooks:

```tsx
// hooks/usePoetryCard.ts
function usePoetryCard(poetryId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    // API call to update like status
  }, []);

  const handleShare = useCallback(() => {
    setIsShared(true);
    // Share logic
  }, []);

  return {
    isLiked,
    isShared,
    handleLike,
    handleShare,
  };
}

// Component using the hook
function PoetryCard({ poetryId, ...props }: PoetryCardProps) {
  const { isLiked, isShared, handleLike, handleShare } =
    usePoetryCard(poetryId);

  return (
    <article>
      {/* Component JSX */}
      <button onClick={handleLike}>{isLiked ? "❤️" : "🤍"}</button>
    </article>
  );
}
```

## TypeScript Guidelines

### Type Definitions

#### Component Props

```tsx
// Base props interface
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  "data-testid"?: string;
}

// Specific component props
interface PoetryCardProps extends BaseComponentProps {
  poetry: Poetry;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onLike?: (poetryId: string) => void;
  onShare?: (poetry: Poetry) => void;
}
```

#### Event Handlers

```tsx
interface FormComponentProps {
  onSubmit: (data: FormData) => Promise<void>;
  onChange: (field: string, value: string) => void;
  onError: (error: Error) => void;
}
```

#### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  error?: string | null;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  loading,
  error,
}: ListProps<T>) {
  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

### Type Safety

#### Discriminated Unions

```tsx
type ButtonVariant =
  | { variant: "primary"; color?: never }
  | { variant: "secondary"; color?: never }
  | { variant: "custom"; color: string };

interface ButtonProps extends ButtonVariant {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

#### Utility Types

```tsx
// Pick specific properties
type PoetryCardData = Pick<Poetry, "id" | "title" | "poet" | "content">;

// Make some properties optional
type PartialPoetry = Partial<Pick<Poetry, "translation" | "metadata">>;

// Create union types
type PoetryCategory = Poetry["category"];
type SupportedLanguage = "ur" | "hi" | "en";
```

## Styling Guidelines

### CSS Modules

Use CSS Modules for component-specific styles:

```tsx
// PoetryCard.module.css
.poetryCard {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  background: var(--surface-background);
}

.poetryCard__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.poetryCard__content {
  font-family: var(--font-urdu);
  line-height: var(--line-height-relaxed);
  direction: rtl;
  text-align: right;
}

.poetryCard--compact {
  padding: var(--spacing-sm);
}

.poetryCard--compact .poetryCard__title {
  font-size: var(--font-size-md);
}

// Component usage
import styles from './PoetryCard.module.css';

function PoetryCard({ variant = 'default', ...props }: PoetryCardProps) {
  return (
    <article
      className={cn(
        styles.poetryCard,
        variant === 'compact' && styles['poetryCard--compact']
      )}
    >
      <h3 className={styles.poetryCard__title}>{props.title}</h3>
      <div className={styles.poetryCard__content}>{props.content}</div>
    </article>
  );
}
```

### Tailwind CSS Classes

Use Tailwind for utility styles:

```tsx
function PoetryCard({ className, ...props }: PoetryCardProps) {
  return (
    <article
      className={cn(
        // Base styles
        "border border-border rounded-lg p-4 bg-card",
        // Responsive styles
        "sm:p-6 md:p-8",
        // Interactive styles
        "hover:shadow-md transition-shadow",
        // Custom className
        className
      )}
    >
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {props.title}
      </h3>
      <div className="font-urdu leading-relaxed text-right rtl">
        {props.content}
      </div>
    </article>
  );
}
```

### CSS Variables

Define consistent design tokens:

```css
/* globals.css */
:root {
  /* Colors */
  --color-primary: #10b981;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;

  /* Typography */
  --font-family-urdu: "Noto Nastaliq Urdu", serif;
  --font-family-hindi: "Noto Sans Devanagari", sans-serif;
  --font-family-english: "Inter", sans-serif;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

## Testing Requirements

### Unit Tests

Every component must have unit tests:

```tsx
// PoetryCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PoetryCard } from "./PoetryCard";

const mockPoetry = {
  id: "rec123",
  title: "Test Ghazal",
  poet: "Test Poet",
  content: "Test content...",
  category: "ghazal" as const,
  language: "ur" as const,
};

describe("PoetryCard", () => {
  it("renders poetry information correctly", () => {
    render(<PoetryCard poetry={mockPoetry} />);

    expect(screen.getByText("Test Ghazal")).toBeInTheDocument();
    expect(screen.getByText("Test Poet")).toBeInTheDocument();
    expect(screen.getByText("Test content...")).toBeInTheDocument();
  });

  it("calls onLike when like button is clicked", () => {
    const mockOnLike = jest.fn();
    render(<PoetryCard poetry={mockPoetry} showActions onLike={mockOnLike} />);

    const likeButton = screen.getByRole("button", { name: /like/i });
    fireEvent.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(mockPoetry.id);
  });

  it("applies custom className", () => {
    const { container } = render(
      <PoetryCard poetry={mockPoetry} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders in compact variant", () => {
    render(<PoetryCard poetry={mockPoetry} variant="compact" />);

    const article = screen.getByRole("article");
    expect(article).toHaveClass("poetry-card--compact");
  });
});
```

### Integration Tests

Test component interactions:

```tsx
// PoetryList.integration.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { SWRProvider } from "@/test-utils";
import { PoetryList } from "./PoetryList";

const mockPoetriesResponse = {
  success: true,
  data: [mockPoetry1, mockPoetry2],
  pagination: { total: 2, page: 1, limit: 20, hasNext: false },
};

jest.mock("@/lib/airtable-fetcher", () => ({
  fetcher: jest.fn(() => Promise.resolve(mockPoetriesResponse)),
}));

describe("PoetryList Integration", () => {
  it("loads and displays poetry list", async () => {
    render(
      <SWRProvider>
        <PoetryList category="ashaar" />
      </SWRProvider>
    );

    // Shows loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Shows poetry items after loading
    await waitFor(() => {
      expect(screen.getByText("Test Ghazal 1")).toBeInTheDocument();
      expect(screen.getByText("Test Ghazal 2")).toBeInTheDocument();
    });
  });
});
```

### Accessibility Tests

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("PoetryCard Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<PoetryCard poetry={mockPoetry} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper heading hierarchy", () => {
    render(<PoetryCard poetry={mockPoetry} />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("has proper button labels", () => {
    render(<PoetryCard poetry={mockPoetry} showActions />);

    expect(
      screen.getByRole("button", { name: /like poetry/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /share poetry/i })
    ).toBeInTheDocument();
  });
});
```

## Performance Guidelines

### React.memo Usage

Use React.memo for expensive components:

```tsx
import { memo } from "react";

interface PoetryCardProps {
  poetry: Poetry;
  onLike?: (id: string) => void;
}

const PoetryCard = memo(
  function PoetryCard({ poetry, onLike }: PoetryCardProps) {
    return <article>{/* Component JSX */}</article>;
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimization
    return (
      prevProps.poetry.id === nextProps.poetry.id &&
      prevProps.poetry.updatedTime === nextProps.poetry.updatedTime
    );
  }
);
```

### useCallback and useMemo

Optimize callbacks and expensive calculations:

```tsx
function PoetryList({ poetries, onLike, onShare }: PoetryListProps) {
  // Memoize expensive calculations
  const sortedPoetries = useMemo(() => {
    return poetries.sort(
      (a, b) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    );
  }, [poetries]);

  // Memoize callbacks
  const handleLike = useCallback(
    (poetryId: string) => {
      onLike?.(poetryId);
    },
    [onLike]
  );

  const handleShare = useCallback(
    (poetry: Poetry) => {
      onShare?.(poetry);
    },
    [onShare]
  );

  return (
    <div>
      {sortedPoetries.map((poetry) => (
        <PoetryCard
          key={poetry.id}
          poetry={poetry}
          onLike={handleLike}
          onShare={handleShare}
        />
      ))}
    </div>
  );
}
```

### Virtual Scrolling

For large lists, implement virtual scrolling:

```tsx
import { FixedSizeList as List } from "react-window";

interface VirtualPoetryListProps {
  poetries: Poetry[];
  height: number;
  itemHeight: number;
}

function VirtualPoetryList({
  poetries,
  height,
  itemHeight,
}: VirtualPoetryListProps) {
  const Row = useCallback(
    ({ index, style }: any) => (
      <div style={style}>
        <PoetryCard poetry={poetries[index]} />
      </div>
    ),
    [poetries]
  );

  return (
    <List
      height={height}
      itemCount={poetries.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## Accessibility Standards

### ARIA Labels and Roles

```tsx
function PoetryCard({ poetry, onLike, onShare }: PoetryCardProps) {
  return (
    <article
      role="article"
      aria-labelledby={`poetry-title-${poetry.id}`}
      aria-describedby={`poetry-content-${poetry.id}`}
    >
      <h3 id={`poetry-title-${poetry.id}`}>{poetry.title}</h3>

      <div id={`poetry-content-${poetry.id}`} aria-label="Poetry content">
        {poetry.content}
      </div>

      <div role="group" aria-label="Poetry actions">
        <button
          onClick={() => onLike(poetry.id)}
          aria-label={`Like poetry: ${poetry.title}`}
          aria-pressed={poetry.isLiked}
        >
          {poetry.isLiked ? "❤️" : "🤍"}
        </button>

        <button
          onClick={() => onShare(poetry)}
          aria-label={`Share poetry: ${poetry.title}`}
        >
          📤
        </button>
      </div>
    </article>
  );
}
```

### Keyboard Navigation

```tsx
function PoetryCard({ poetry }: PoetryCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        // Handle card selection
        break;
      case "ArrowDown":
        // Focus next card
        break;
      case "ArrowUp":
        // Focus previous card
        break;
    }
  };

  return (
    <article
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:ring-2 focus:ring-primary focus:outline-none"
    >
      {/* Content */}
    </article>
  );
}
```

### Screen Reader Support

```tsx
function PoetryCard({ poetry }: PoetryCardProps) {
  return (
    <article>
      <h3>
        <span className="sr-only">Poetry title: </span>
        {poetry.title}
      </h3>

      <p>
        <span className="sr-only">By poet: </span>
        {poetry.poet}
      </p>

      <div>
        <span className="sr-only">Poetry content: </span>
        {poetry.content}
      </div>

      <div>
        <span className="sr-only">
          Category: {poetry.category}, Language: {poetry.language}
        </span>
      </div>
    </article>
  );
}
```

## Internationalization

### Text Direction

Handle RTL languages properly:

```tsx
function PoetryText({ content, language }: PoetryTextProps) {
  const isRTL = ["ur", "ar", "fa"].includes(language);

  return (
    <div
      className={cn(
        "poetry-text",
        isRTL && "rtl text-right",
        language === "ur" && "font-urdu",
        language === "hi" && "font-hindi",
        language === "en" && "font-english"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
    >
      {content}
    </div>
  );
}
```

### Localized Messages

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function PoetryCard({ poetry }: PoetryCardProps) {
  const { t } = useLanguage();

  return (
    <article>
      <h3>{poetry.title}</h3>
      <p>
        {t("poetry.by")} {poetry.poet}
      </p>
      <div>{poetry.content}</div>

      <div>
        <button aria-label={t("poetry.actions.like")}>
          {t("actions.like")}
        </button>
        <button aria-label={t("poetry.actions.share")}>
          {t("actions.share")}
        </button>
      </div>
    </article>
  );
}
```

## Documentation Requirements

### Component Documentation

Each component must include comprehensive documentation:

````tsx
/**
 * PoetryCard - A card component for displaying poetry information
 *
 * @example
 * ```tsx
 * <PoetryCard
 *   poetry={poetryData}
 *   variant="compact"
 *   showActions
 *   onLike={(id) => handleLike(id)}
 * />
 * ```
 */
function PoetryCard(props: PoetryCardProps) {
  // Implementation
}
````

### README.md Structure

Each component directory should include a README.md:

````markdown
# PoetryCard

A reusable card component for displaying poetry content with actions.

## Usage

```tsx
import { PoetryCard } from "@/components/common/PoetryCard";

function MyComponent() {
  return (
    <PoetryCard
      poetry={poetryData}
      variant="default"
      showActions
      onLike={handleLike}
      onShare={handleShare}
    />
  );
}
```
````

## Props

| Prop          | Type                                   | Default     | Description             |
| ------------- | -------------------------------------- | ----------- | ----------------------- |
| `poetry`      | `Poetry`                               | -           | Poetry data object      |
| `variant`     | `'default' \| 'compact' \| 'detailed'` | `'default'` | Visual variant          |
| `showActions` | `boolean`                              | `false`     | Show like/share buttons |
| `onLike`      | `(id: string) => void`                 | -           | Like button callback    |
| `onShare`     | `(poetry: Poetry) => void`             | -           | Share button callback   |

## Variants

- **default**: Standard card with full information
- **compact**: Smaller card with minimal information
- **detailed**: Expanded card with additional metadata

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader optimized
- Focus management

## Examples

### Basic Usage

[Code example]

### With Actions

[Code example]

### Different Variants

[Code examples]

````

### Storybook Documentation

Create stories for visual documentation:

```tsx
// PoetryCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PoetryCard } from './PoetryCard';

const meta: Meta<typeof PoetryCard> = {
  title: 'Components/Common/PoetryCard',
  component: PoetryCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying poetry content with optional actions.'
      }
    }
  },
  args: {
    poetry: {
      id: 'rec123',
      title: 'دل سے دل تک',
      poet: 'مرزا غالب',
      content: 'یہ غزل کا متن...',
      category: 'ghazal',
      language: 'ur'
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed']
    },
    showActions: {
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    variant: 'compact'
  }
};

export const WithActions: Story = {
  args: {
    showActions: true,
    onLike: (id) => console.log('Liked:', id),
    onShare: (poetry) => console.log('Shared:', poetry)
  }
};
````

This documentation provides comprehensive guidelines for component development in the Jahannuma platform, ensuring consistency, quality, and maintainability across all components.
