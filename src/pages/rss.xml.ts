import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '~/utils/posts';
import { business } from '~/data/business';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${business.shortName} · Insights`,
    description:
      'Notes from behind the counter at Targeteers Archery Pro Shop in Saddle Brook, New Jersey. Tuning, gear, hunting, kids and leagues.',
    site: context.site!,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/insights/${post.id}/`,
      categories: [post.data.category],
      author: post.data.author,
    })),
    customData: '<language>en-us</language>',
  });
}
