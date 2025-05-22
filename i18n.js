// i18n.js - 다국어 지원을 위한 리소스 파일

// 언어 리소스 객체
const translations = {
  // 한국어 (기본값)
  ko: {
    // 공통 헤더 및 네비게이션
    'beta.notice': '🚧 현재는 테스트 중인 개발 버전입니다. 일부 기능이 작동하지 않을 수 있습니다.',
    'dashboard.title': 'HYolss Dashboard',
    'profile.settings': '프로필 설정',
    'notification.settings': '알림 설정',
    'logout': '로그아웃',
    
    // 로그인 페이지
    'login.message': 'Discord로 로그인하여 대시보드에 접근하세요.',
    'login.with.discord': 'Discord로 로그인',
    'login.remember': '다음에 자동으로 로그인',
    
    // 서버 선택 페이지
    'server.select': '서버 선택',
    'server.description': '봇이 초대된 서버 중에서 관리하고 싶은 서버를 선택하세요.',
    'server.loading': '서버 목록을 불러오는 중...',
    'server.none': '관리 권한이 있는 서버가 없습니다.',
    'server.invite': '봇 초대하기',
    'server.error': '서버 목록을 불러오는데 실패했습니다.',
    'server.retry': '다시 시도',
    
    // 대시보드 네비게이션
    'nav.overview': '개요',
    'nav.commands': '명령어',
    'nav.settings': '설정',
    'nav.logs': '로그',
    
    // 대시보드 개요 섹션
    'overview.members': '멤버 수',
    'overview.commands': '명령어 사용량',
    'overview.features': '활성 기능',
    'overview.quick': '빠른 작업',
    'overview.welcome': '환영 메시지 설정',
    'overview.roles': '자동 역할 관리',
    'overview.moderation': '관리 시스템 설정',
    
    // 명령어 섹션
    'commands.title': '명령어 관리',
    'commands.loading': '명령어 목록을 불러오는 중...',
    
    // 설정 섹션
    'settings.title': '봇 설정',
    'settings.basic': '기본 설정',
    'settings.prefix': '명령어 접두사',
    'settings.language': '언어',
    'settings.features': '기능 활성화',
    'settings.welcome': '환영 메시지',
    'settings.moderation': '관리 시스템',
    'settings.autorole': '자동 역할',
    'settings.logging': '로그 기록',
    'settings.save': '설정 저장',
    
    // 로그 섹션
    'logs.title': '로그 기록',
    'logs.all': '모든 로그',
    'logs.commands': '명령어',
    'logs.moderation': '관리',
    'logs.members': '멤버',
    'logs.filter': '필터 적용',
    'logs.loading': '로그를 불러오는 중...',
    'logs.time': '시간',
    'logs.type': '유형',
    'logs.user': '사용자',
    'logs.content': '내용',
    
    // 테마
    'theme.dark': 'Dark Mode',
    
    // 푸터
    'footer.copyright': '© 2025 SOIV Studio, Palette Square Studio',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.legal': 'Legal Notice'
  },
  
  // 영어
  en: {
    // 공통 헤더 및 네비게이션
    'beta.notice': '🚧 This is a development version under testing. Some features may not work properly.',
    'dashboard.title': 'HYolss Dashboard',
    'profile.settings': 'Profile Settings',
    'notification.settings': 'Notification Settings',
    'logout': 'Logout',
    
    // 로그인 페이지
    'login.message': 'Log in with Discord to access the dashboard.',
    'login.with.discord': 'Log in with Discord',
    'login.remember': 'Automatically log in next time',
    
    // 서버 선택 페이지
    'server.select': 'Select Server',
    'server.description': 'Select the server you want to manage from the servers the bot has been invited to.',
    'server.loading': 'Loading server list...',
    'server.none': 'You don\'t have any servers with management permissions.',
    'server.invite': 'Invite Bot',
    'server.error': 'Failed to load server list.',
    'server.retry': 'Retry',
    
    // 대시보드 네비게이션
    'nav.overview': 'Overview',
    'nav.commands': 'Commands',
    'nav.settings': 'Settings',
    'nav.logs': 'Logs',
    
    // 대시보드 개요 섹션
    'overview.members': 'Member Count',
    'overview.commands': 'Command Usage',
    'overview.features': 'Active Features',
    'overview.quick': 'Quick Actions',
    'overview.welcome': 'Setup Welcome Message',
    'overview.roles': 'Manage Auto Roles',
    'overview.moderation': 'Setup Moderation System',
    
    // 명령어 섹션
    'commands.title': 'Command Management',
    'commands.loading': 'Loading commands list...',
    
    // 설정 섹션
    'settings.title': 'Bot Settings',
    'settings.basic': 'Basic Settings',
    'settings.prefix': 'Command Prefix',
    'settings.language': 'Language',
    'settings.features': 'Feature Activation',
    'settings.welcome': 'Welcome Message',
    'settings.moderation': 'Moderation System',
    'settings.autorole': 'Auto Role',
    'settings.logging': 'Logging',
    'settings.save': 'Save Settings',
    
    // 로그 섹션
    'logs.title': 'Logs',
    'logs.all': 'All Logs',
    'logs.commands': 'Commands',
    'logs.moderation': 'Moderation',
    'logs.members': 'Members',
    'logs.filter': 'Apply Filter',
    'logs.loading': 'Loading logs...',
    'logs.time': 'Time',
    'logs.type': 'Type',
    'logs.user': 'User',
    'logs.content': 'Content',
    
    // 테마
    'theme.dark': 'Dark Mode',
    
    // 푸터
    'footer.copyright': '© 2025 SOIV Studio, Palette Square Studio',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.legal': 'Legal Notice'
  },
  
  // 일본어
  ja: {
    // 공통 헤더 및 네비게이션
    'beta.notice': '🚧 これはテスト中の開発バージョンです。一部の機能が動作しない場合があります。',
    'dashboard.title': 'HYolss ダッシュボード',
    'profile.settings': 'プロフィール設定',
    'notification.settings': '通知設定',
    'logout': 'ログアウト',
    
    // 로그인 페이지
    'login.message': 'Discordでログインしてダッシュボードにアクセスしてください。',
    'login.with.discord': 'Discordでログイン',
    'login.remember': '次回から自動的にログイン',
    
    // 서버 선택 페이지
    'server.select': 'サーバーを選択',
    'server.description': 'ボットが招待されているサーバーから管理したいサーバーを選択してください。',
    'server.loading': 'サーバーリストを読み込み中...',
    'server.none': '管理権限のあるサーバーがありません。',
    'server.invite': 'ボットを招待',
    'server.error': 'サーバーリストの読み込みに失敗しました。',
    'server.retry': '再試行',
    
    // 대시보드 네비게이션
    'nav.overview': '概要',
    'nav.commands': 'コマンド',
    'nav.settings': '設定',
    'nav.logs': 'ログ',
    
    // 대시보드 개요 섹션
    'overview.members': 'メンバー数',
    'overview.commands': 'コマンド使用量',
    'overview.features': '有効な機能',
    'overview.quick': 'クイックアクション',
    'overview.welcome': '歓迎メッセージの設定',
    'overview.roles': '自動ロール管理',
    'overview.moderation': 'モデレーションシステムの設定',
    
    // 명령어 섹션
    'commands.title': 'コマンド管理',
    'commands.loading': 'コマンドリストを読み込み中...',
    
    // 설정 섹션
    'settings.title': 'ボット設定',
    'settings.basic': '基本設定',
    'settings.prefix': 'コマンドプレフィックス',
    'settings.language': '言語',
    'settings.features': '機能の有効化',
    'settings.welcome': '歓迎メッセージ',
    'settings.moderation': 'モデレーションシステム',
    'settings.autorole': '自動ロール',
    'settings.logging': 'ログ記録',
    'settings.save': '設定を保存',
    
    // 로그 섹션
    'logs.title': 'ログ記録',
    'logs.all': 'すべてのログ',
    'logs.commands': 'コマンド',
    'logs.moderation': 'モデレーション',
    'logs.members': 'メンバー',
    'logs.filter': 'フィルター適用',
    'logs.loading': 'ログを読み込み中...',
    'logs.time': '時間',
    'logs.type': 'タイプ',
    'logs.user': 'ユーザー',
    'logs.content': '内容',
    
    // 테마
    'theme.dark': 'ダークモード',
    
    // 푸터
    'footer.copyright': '© 2025 SOIV Studio, Palette Square Studio',
    'footer.terms': '利用規約',
    'footer.privacy': 'プライバシー',
    'footer.legal': '法的通知'
  }
};

// 현재 언어 설정 (기본값: 한국어)
let currentLanguage = localStorage.getItem('language') || 'ko';

// 언어 변경 함수
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`지원하지 않는 언어입니다: ${lang}`);
    return false;
  }
  
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // 페이지의 모든 번역 요소 업데이트
  updatePageTranslations();
  
  return true;
}

// 번역 텍스트 가져오기 함수
function t(key) {
  const translation = translations[currentLanguage];
  if (!translation) {
    return key; // 번역이 없으면 키 반환
  }
  
  return translation[key] || key; // 번역이 없으면 키 반환
}

// 페이지 언어 적용 함수
function updatePageTranslations() {
  // data-i18n 속성을 가진 모든 요소에 번역 적용
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    // 속성에 따라 다르게 적용
    if (element.tagName === 'INPUT' && element.type === 'placeholder') {
      element.placeholder = t(key);
    } else if (element.tagName === 'INPUT' && element.type === 'value') {
      element.value = t(key);
    } else {
      element.textContent = t(key);
    }
  });
  
  // 언어 선택기 업데이트
  const languageSelector = document.getElementById('language-setting');
  if (languageSelector) {
    languageSelector.value = currentLanguage;
  }
  
  // 다국어 이벤트 발생 (다른 스크립트가 감지할 수 있도록)
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: currentLanguage } 
  }));
}

// 초기화 함수
function initializeI18n() {
  // 언어 설정이 있으면 적용
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  }
  
  // 언어 선택기 이벤트 리스너 설정
  const languageSelector = document.getElementById('language-setting');
  if (languageSelector) {
    languageSelector.value = currentLanguage;
    languageSelector.addEventListener('change', function() {
      setLanguage(this.value);
    });
  }
  
  // 초기 페이지 번역 적용
  updatePageTranslations();
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', initializeI18n);

// 언어 기능 내보내기
export { t, setLanguage, currentLanguage, initializeI18n };
