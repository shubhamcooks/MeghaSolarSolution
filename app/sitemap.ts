import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '', '/pm-surya-ghar', '/how-it-works', '/services', '/services/solar-water-heater',
    '/service-areas', '/apply', '/track', '/about', '/government-tenders',
    '/tenders', '/contact', '/faq', '/privacy', '/terms',
    '/login', '/register', '/forgot-password', '/reset-password',
    '/energy-analysis', '/solar-calculator', '/future-benefits',
    '/dashboard/customer', '/dashboard/staff', '/dashboard/admin',
    '/admin', '/admin/users', '/admin/tenders', '/admin/districts', '/admin/cms',
  ];

  return routes.map((route) => ({
    url: `https://meghasolar.example.com${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
