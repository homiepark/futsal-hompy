export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://oqrzlrhgibfstgqhhlwk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnpscmhnaWJmc3RncWhobHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU0NTEsImV4cCI6MjA5MDU1MTQ1MX0.hhjuuhjq59M_TBNlxg27mxFFHPaOa7mW5egPNqO777o';
const SITE_URL = 'https://xn--oy2bq2kj9eita652c.com';
const DEFAULT_IMAGE = 'https://futsal-hompy.vercel.app/assets/top-banner-ME2I35U_.jpg';
const SITE_NAME = '우리의풋살 ⚽';

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

function html(title, desc, image, url) {
  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"/><title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:url" content="${esc(url)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${esc(SITE_NAME)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
<meta http-equiv="refresh" content="0;url=${esc(url)}"/>
</head><body><p>Redirecting...</p></body></html>`;
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const team = searchParams.get('team');

  const headers = { 'Content-Type': 'text/html; charset=utf-8' };

  try {
    if (type === 'team' && id) {
      const data = await supabaseFetch('teams', `id=eq.${id}&select=name,emblem,photo_url,level,region,district`);
      if (data && data[0]) {
        const t = data[0];
        return new Response(
          html(`⚽ ${t.name}`, `${t.region || ''} ${t.district || ''} | LV.${t.level}`, t.photo_url || DEFAULT_IMAGE, `${SITE_URL}/team/${id}`),
          { headers }
        );
      }
    }

    if (type === 'post' && id) {
      const postData = await supabaseFetch('archive_posts', `id=eq.${id}&select=content,image_url,team_id`);
      if (postData && postData[0]) {
        const post = postData[0];
        const teamId = team || post.team_id;
        const teamData = await supabaseFetch('teams', `id=eq.${teamId}&select=name,photo_url`);
        const teamName = teamData && teamData[0] ? teamData[0].name : '팀';
        const image = post.image_url || (teamData && teamData[0] && teamData[0].photo_url) || DEFAULT_IMAGE;
        return new Response(
          html(`📸 ${teamName} 팀 스토리`, post.content ? post.content.slice(0, 60) : '새 게시글', image, `${SITE_URL}/archive?team=${teamId}&post=${id}`),
          { headers }
        );
      }
    }

    return new Response(html(SITE_NAME, '풋살 모임 매칭 & 팀 관리 앱', DEFAULT_IMAGE, SITE_URL), { headers });
  } catch {
    return new Response(html(SITE_NAME, '풋살 모임 매칭 & 팀 관리 앱', DEFAULT_IMAGE, SITE_URL), { headers });
  }
}
