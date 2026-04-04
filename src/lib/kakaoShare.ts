declare global {
  interface Window {
    Kakao: any;
  }
}

export function initKakao() {
  if (!window.Kakao) {
    console.error('Kakao SDK not loaded');
    return false;
  }
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init('5d705929d0b639a044d263edf8e1b90d');
  }
  return window.Kakao.isInitialized();
}

interface KakaoShareParams {
  title: string;
  imageUrl?: string;
  linkUrl: string;
  buttonTitle?: string;
}

export function shareToKakao({ title, imageUrl, linkUrl, buttonTitle = '팀 보러가기' }: KakaoShareParams) {
  if (!initKakao()) {
    // SDK 미로드 시 URL 공유로 대체
    if (navigator.share) {
      navigator.share({ title: `⚽ ${title}`, text: `${title}에 초대합니다!`, url: linkUrl });
    } else {
      navigator.clipboard.writeText(linkUrl);
      alert('팀 링크가 복사되었습니다!');
    }
    return;
  }

  try {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `⚽ ${title}`,
        description: `${title}에 초대합니다! 우리의풋살에서 함께 뛰어요!`,
        imageUrl: imageUrl || 'https://xn--oy2bq2kj9eita652c.com/assets/top-banner-ME2I35U_.jpg',
        imageWidth: 800,
        imageHeight: 800,
        link: {
          mobileWebUrl: linkUrl,
          webUrl: linkUrl,
        },
      },
      buttons: [
        {
          title: buttonTitle,
          link: {
            mobileWebUrl: linkUrl,
            webUrl: linkUrl,
          },
        },
      ],
    });
  } catch (e) {
    console.error('Kakao share error:', e);
    // 실패 시 URL 복사로 대체
    navigator.clipboard.writeText(linkUrl);
    alert('카카오 공유 실패 - 팀 링크가 복사되었습니다!');
  }
}
