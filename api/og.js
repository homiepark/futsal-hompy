export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://oqrzlrhgibfstgqhhlwk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnpscmhnaWJmc3RncWhobHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU0NTEsImV4cCI6MjA5MDU1MTQ1MX0.hhjuuhjq59M_TBNlxg27mxFFHPaOa7mW5egPNqO777o';
const SITE_URL = 'https://xn--oy2bq2kj9eita652c.com';
const DEFAULT_IMAGE = 'https://futsal-hompy.vercel.app/assets/top-banner-ME2I35U_.jpg';

async function supabaseFetch(table, query) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function makeHTML(title, desc, image, redirectUrl) {
  // OG tags use HTML-escaped values, but JS redirect uses raw URL
  return new Response(
    `<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:url" content="${esc(redirectUrl)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="우리의풋살"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
</head>
<body>
<noscript><meta http-equiv="refresh" content="0;url=${esc(redirectUrl)}"/></noscript>
<script>location.href="${redirectUrl}";</script>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export default async function handler(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');
  const team = url.searchParams.get('team');

  try {
    // 팀 공유
    if (type === 'team' && id) {
      const data = await supabaseFetch('teams', `id=eq.${id}&select=name,photo_url,level,region,district`);
      if (data && data[0]) {
        const t = data[0];
        return makeHTML(
          `⚽ ${t.name}`,
          `${t.region || ''} ${t.district || ''} | LV.${t.level} | 우리의풋살`,
          t.photo_url || DEFAULT_IMAGE,
          `${SITE_URL}/team/${id}`
        );
      }
    }

    // 게시글 공유
    if (type === 'post' && id) {
      const postData = await supabaseFetch('archive_posts', `id=eq.${id}&select=content,image_url,image_urls,team_id`);
      if (postData && postData[0]) {
        const post = postData[0];
        const teamId = team || post.team_id;
        const teamData = await supabaseFetch('teams', `id=eq.${teamId}&select=name,photo_url`);
        const teamName = teamData && teamData[0] ? teamData[0].name : '팀';

        // 이미지 우선순위: image_url > image_urls[0] > team photo > default
        let image = post.image_url;
        if (!image && post.image_urls && post.image_urls.length > 0) {
          image = post.image_urls[0];
        }
        if (!image && teamData && teamData[0]) {
          image = teamData[0].photo_url;
        }
        if (!image) {
          image = DEFAULT_IMAGE;
        }

        return makeHTML(
          `📸 ${teamName} 팀 스토리`,
          post.content ? post.content.slice(0, 60) : '새 게시글',
          image,
          `${SITE_URL}/archive?team=${teamId}&post=${id}`
        );
      }
    }
  } catch {
    // fall through to default
  }

  return makeHTML('우리의풋살 ⚽', '풋살 모임 매칭 & 팀 관리 앱', DEFAULT_IMAGE, SITE_URL);
}
