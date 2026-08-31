'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    slug: 'optimizing-room-occupancy',
    title: 'Optimizing Room Occupancy: A PMS Strategy Guide',
    description: 'Learn how to leverage dynamic pricing and time-based slots to maximize your property revenue during peak and off-peak seasons.',
    author: 'Rahul Sharma',
    authorTitle: 'Hospitality Consultant',
    authorImage: 'https://picsum.photos/seed/author1/40/40',
    date: 'October 26, 2023',
    category: 'Revenue',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
    imageHint: 'luxury hotel room',
  },
  {
    slug: 'housekeeping-efficiency-tips',
    title: 'Streamlining Housekeeping with Digital Workflows',
    description: 'Stop using paper lists. Discover how real-time task assignment can speed up room turnarounds and improve guest satisfaction.',
    author: 'Meena Devi',
    authorTitle: 'Operations Manager',
    authorImage: 'https://picsum.photos/seed/author2/40/40',
    date: 'October 22, 2023',
    category: 'Operations',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800',
    imageHint: 'clean white bed',
  },
  {
    slug: 'guest-experience-personalization',
    title: 'The Art of Personalization: Using Guest Profiles',
    description: 'How a detailed Guest CRM allows your staff to anticipate needs, from dietary preferences to favorite room types.',
    author: 'David Chen',
    authorTitle: 'Experience Designer',
    authorImage: 'https://picsum.photos/seed/author3/40/40',
    date: 'October 18, 2023',
    category: 'Experience',
    image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800',
    imageHint: 'concierge desk',
  },
    {
    slug: 'digital-billing-future',
    title: 'Why Digital Bills & QR Codes are the Future of Check-out',
    description: 'Provide your guests with instant access to their itemized bill on their own smartphones, reducing friction at the front desk.',
    author: 'Sara Wick',
    authorTitle: 'Tech Analyst',
    authorImage: 'https://picsum.photos/seed/author4/40/40',
    date: 'October 15, 2023',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800',
    imageHint: 'person holding smartphone',
  },
];

export default function BlogPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-headline">
              Hospitality Insights
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Tips, updates, and strategies from the Adyfire team to help you manage your property like a pro.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="p-0">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-48 w-full">
                        <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        data-ai-hint={post.imageHint}
                        />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                    <h2 className="text-xl font-semibold font-headline mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.authorImage} alt={post.author} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
