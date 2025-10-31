import { allPosts } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    category: post.url.split('/')[1],
    slug: post.url.split('/')[2],
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const post = allPosts.find((p) => p.url === `/${resolvedParams.category}/${resolvedParams.slug}` || p.url === `/${resolvedParams.category}/${resolvedParams.slug}/`);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const post = allPosts.find((p) => p.url === `/${resolvedParams.category}/${resolvedParams.slug}` || p.url === `/${resolvedParams.category}/${resolvedParams.slug}/`);

  if (!post) notFound();

  // Get related posts
  const relatedPosts = post.relatedPosts
    ? post.relatedPosts
        .map((url) => allPosts.find((p) => p.url === url))
        .filter(Boolean)
        .slice(0, 2)
    : [];

  // Get trending articles for sidebar
  const trendingArticles = allPosts
    .filter((p) => p.url !== post.url)
    .slice(0, 5)
    .map((p) => ({
      title: p.title,
      url: p.url,
      views: Math.floor(Math.random() * 10000) + 1000,
      category: p.category,
    }))
    .sort((a, b) => b.views - a.views);

  // Mock comments data (in production, fetch from database)
  const mockComments = [
    {
      id: '1',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      content: 'This article completely changed how I approach YouTube titles. The 7-word rule is gold!',
      timestamp: '2 hours ago',
      likes: 12,
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: 'MC',
      content: 'Really appreciate the data-driven approach. Would love to see more case studies like this.',
      timestamp: '5 hours ago',
      likes: 8,
    },
  ];

  const fullUrl = `https://blog.tightslice.com${post.url}`;

  return (
    <>
      <ArticleClient
        post={post}
        relatedPosts={relatedPosts}
        trendingArticles={trendingArticles}
        mockComments={mockComments}
        fullUrl={fullUrl}
      />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            datePublished: post.publishedAt,
            publisher: {
              '@type': 'Organization',
              name: 'TightSlice Marketing Technologies',
              logo: {
                '@type': 'ImageObject',
                url: 'https://blog.tightslice.com/logo.png',
              },
            },
          }),
        }}
      />
    </>
  );
}
