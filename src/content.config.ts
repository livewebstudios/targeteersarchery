import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum([
        'Tuning & Gear',
        'Getting Started',
        'Hunting',
        'Kids & Family',
        'Leagues & Community',
        'From the Family',
      ]),
      image: image().optional(),
      imageAlt: z.string().default(''),
      author: z.string().default('Targeteers Archery'),
      draft: z.boolean().default(false),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    location: z.string().default('Targeteers Archery Pro Shop, Saddle Brook, NJ'),
    summary: z.string(),
    link: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const leagues = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leagues' }),
  schema: z.object({
    name: z.string(),
    audience: z.enum(['adult', 'youth']),
    night: z.string(),
    time: z.string(),
    weeks: z.number(),
    startDate: z.string().optional(),
    status: z.enum(['forming', 'open', 'full', 'closed']),
    notes: z.string().optional(),
    order: z.number().default(0),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    group: z.enum(['The Range', 'Lessons & Kids', 'Tuning & Repairs', 'Buying a Bow', 'Hunting']),
    order: z.number().default(0),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      image: image().optional(),
      certifications: z.array(z.string()).default([]),
      order: z.number().default(0),
    }),
});

const brands = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/brands' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    dealerClaim: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    keywords: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

export const collections = { insights, events, leagues, faq, team, brands };
