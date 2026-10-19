<script>
  import '../app.css';
  import { page } from '$app/state';
  import { SITE, absoluteUrl, canonicalUrl, structuredData } from '$lib/seo';

  let { children } = $props();

  const canonical = $derived(canonicalUrl(page.url.pathname));
  const ogImage = $derived(absoluteUrl(SITE.ogImage));
</script>

<svelte:head>
  <title>{SITE.title}</title>
  <meta name="description" content={SITE.description} />
  <meta
    name="keywords"
    content={SITE.keywords.join(', ')}
  />
  <link rel="canonical" href={canonical} />
  <meta
    name="robots"
    content={page.status >= 400 ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
  />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:title" content={SITE.title} />
  <meta property="og:description" content={SITE.description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content={String(SITE.ogImageWidth)} />
  <meta property="og:image:height" content={String(SITE.ogImageHeight)} />
  <meta property="og:image:alt" content={SITE.ogImageAlt} />
  <meta property="og:locale" content={SITE.locale} />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={SITE.title} />
  <meta name="twitter:description" content={SITE.description} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={SITE.ogImageAlt} />

  {@html `<script type="application/ld+json">${JSON.stringify(structuredData())}</script>`}
</svelte:head>

{@render children()}
