
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

const blogPosts = [
  {
    slug: 'optimizing-room-occupancy',
    title: 'Optimizing Room Occupancy: A PMS Strategy Guide',
    description: 'Learn how to leverage dynamic pricing and time-based slots to maximize your property revenue during peak and off-peak seasons. In the hospitality world, every empty room is a lost opportunity. With Adyfire (PMS), you can implement time-based slots (hourly stays) to capture the short-stay market without sacrificing your nightly inventory. By using the dynamic pricing engine, you can automatically adjust rates based on occupancy levels, ensuring your property remains competitive while maintaining healthy margins.',
    author: 'Rahul Sharma',
    authorTitle: 'Hospitality Consultant',
    authorImage: 'https://picsum.photos/seed/author1/40/40',
    date: 'October 26, 2023',
    category: 'Revenue',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
    imageHint: 'luxury hotel room',
  },
  {
    slug: 'housekeeping-efficiency-tips',
    title: 'Streamlining Housekeeping with Digital Workflows',
    description: 'Stop using paper lists. Discover how real-time task assignment can speed up room turnarounds and improve guest satisfaction. Communication is often the biggest bottleneck in property management. Our mobile-optimized housekeeping dashboard allows your cleaning crew to see exactly which rooms are "Dirty" or "Inspecting" the moment a guest checks out. This real-time feedback loop reduces wait times for incoming guests and ensures that your standards of hygiene are met consistently across every floor.',
    author: 'Meena Devi',
    authorTitle: 'Operations Manager',
    authorImage: 'https://picsum.photos/seed/author2/40/40',
    date: 'October 22, 2023',
    category: 'Operations',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200',
    imageHint: 'clean white bed',
  },
  {
    slug: 'guest-experience-personalization',
    title: 'The Art of Personalization: Using Guest Profiles',
    description: 'How a detailed Guest CRM allows your staff to anticipate needs, from dietary preferences to favorite room types. Modern guests expect a tailored experience. By archiving guest histories, Adyfire helps your reception staff greet repeat visitors by name and recall their specific preferences. Whether it\'s a preferred floor or a recurring laundry request, having this data at your fingertips transforms a standard stay into a memorable experience that drives positive reviews and direct re-bookings.',
    author: 'David Chen',
    authorTitle: 'Experience Designer',
    authorImage: 'https://picsum.photos/seed/author3/40/40',
    date: 'October 18, 2023',
    category: 'Experience',
    image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1200',
    imageHint: 'concierge desk',
  },
  {
    slug: 'digital-billing-future',
    title: 'Why Digital Bills & QR Codes are the Future of Check-out',
    description: 'Provide your guests with instant access to their itemized bill on their own smartphones, reducing friction at the front desk. The modern traveler wants autonomy. By offering a unique QR code for each booking, you allow guests to track their service charges—like F&B and laundry—in real-time. This transparency eliminates "bill shock" at check-out and significantly speeds up the departure process, freeing your front desk staff to focus on welcoming new arrivals.',
    author: 'Sara Wick',
    authorTitle: 'Tech Analyst',
    authorImage: 'https://picsum.photos/seed/author4/40/40',
    date: 'October 15, 2023',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1200',
    imageHint: 'person holding smartphone',
  },
];

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
        </Link>
        <article>
          <header className="mb-8">
            <Badge variant="secondary" className="mb-2">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.authorImage} alt={post.author} />
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{post.author}</p>
                        <p className="text-xs">{post.authorTitle}</p>
                    </div>
                </div>
                <span className="text-gray-400">&bull;</span>
                <span>{post.date}</span>
            </div>
          </header>

          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={675}
            className="object-cover w-full rounded-lg shadow-lg mb-8"
            data-ai-hint={post.category === 'Operations' ? 'cleaning service' : 'hotel room'}
            priority
          />

          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-gray-700 dark:text-gray-300 leading-relaxed">
            {post.description.split('. ').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}.</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
