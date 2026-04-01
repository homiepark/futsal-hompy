declare global {
  interface Window {
    Kakao: any;
  }
}

let initialized = false;

export function initKakao() {
  if (initialized) return;
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init('5d705929d0b639a044d263edf8e1b90d');
  }
  initialized = true;
}

interface KakaoShareParams {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  buttonTitle?: string;
}

export function shareToKakao({ title, description, imageUrl, linkUrl, buttonTitle = '팀 보러가기' }: KakaoShareParams) {
  initKakao();

  if (!window.Kakao?.Share) {
    alert('카카오톡 공유 기능을 사용할 수 없습니다.');
    return;
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl: imageUrl || 'https://xn--oy2bq2kj9eita652c.com/assets/top-banner-ME2I35U_.jpg',
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
}
