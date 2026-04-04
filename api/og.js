const SUPABASE_URL = 'https://oqrzlrhgibfstgqhhlwk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnpscmhnaWJmc3RncWhobHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU0NTEsImV4cCI6MjA5MDU1MTQ1MX0.hhjuuhjq59M_TBNlxg27mxFFHPaOa7mW5egPNqO777o';
const SITE_URL = 'https://xn--oy2bq2kj9eita652c.com';
const DEFAULT_IMAGE = 'https://futsal-hompy.vercel.app/assets/top-banner-ME2I35U_.jpg';
const SITE_NAME = '우리의풋살 ⚽';

async function supabaseFetch(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderHTML(title, description, image, url) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const i = escapeHtml(image);
  const u = escapeHtml(url);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${t}</title>
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${i}" />
  <meta property="og:url" content="${u}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${i}" />
  <meta http-equiv="refresh" content="0;url=${u}" />
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  const { type, id, team } = req.query;

  try {
    if (type === 'team' && id) {
      const data = await supabaseFetch('teams', `id=eq.${id}&select=name,emblem,photo_url,level,region,district`);
      if (data && data[0]) {
        const t = data[0];
        const title = `⚽ ${t.name}`;
        const desc = `${t.region || ''} ${t.district || ''} | LV.${t.level} | 우리의풋살에서 함께 뛰어요!`;
        const image = t.photo_url || DEFAULT_IMAGE;
        return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(
          renderHTML(title, desc, image, `${SITE_URL}/team/${id}`)
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
        const image = post.image_url || (teamData && teamData[0] ? teamData[0].photo_url : null) || DEFAULT_IMAGE;
        const title = `📸 ${teamName} 팀 스토리`;
        const content = post.content ? post.content.slice(0, 60) : '새 게시글';
        return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(
          renderHTML(title, content, image, `${SITE_URL}/archive?team=${teamId}&post=${id}`)
        );
      }
    }

    return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(
      renderHTML(SITE_NAME, '풋살 모임 매칭 & 팀 관리 앱', DEFAULT_IMAGE, SITE_URL)
    );
  } catch (e) {
    return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(
      renderHTML(SITE_NAME, '풋살 모임 매칭 & 팀 관리 앱', DEFAULT_IMAGE, SITE_URL)
    );
  }
};
