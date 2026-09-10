import { getCollection, type CollectionEntry } from 'astro:content';

export const CATEGORIES = [
  'Tuning & Gear',
  'Getting Started',
  'Hunting',
  'Kids & Family',
  'Leagues & Community',
  'From the Family',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** URL-safe slug for a category name. */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 225));
}

/** Published posts, newest first. Drafts are excluded from production builds. */
export async function getPosts(): Promise<CollectionEntry<'insights'>[]> {
  const posts = await getCollection('insights', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
