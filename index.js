document.addEventListener('DOMContentLoaded', function() {
  // 백엔드 서버 URL
  const API_URL = 'https://bot-api.soiv-studio.xyz';
  
  // DOM 요소
  const loginContainer = document.getElementById('login-container');
  const serverContainer = document.getElementById('server-container');
  const discordLoginButton = document.getElementById('discord-login-button');
  const serverList = document.getElementById('server-list');
  const serverListContent = document.getElementById('server-list-content');
  const serverLoading = document.getElementById('server-loading');
  const rememberLoginCheckbox = document.getElementById('remember-login');
  const themeSwitch = document.getElementById('theme-switch');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const logoutButton = document.getElementById('logout-button');
  const profileDropdown = document.getElementById('profile-dropdown');
  const headerFrame = document.querySelector('.frame-5');
  
  // 공지사항 배너 닫기 버튼
  const closeBtn = document.getElementById('announcement-close');
  const banner = document.getElementById('announcement-banner');

  if (closeBtn && banner) {
    closeBtn.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }

  // 테마 설정 불러오기
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
  }
  
  // 테마 스위치 이벤트 리스너
  themeSwitch.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });

  // URL 파라미터 확인 (OAuth 콜백 후 처리)
  const urlParams = new URLSearchParams(window.location.search);
  const authSuccess = urlParams.get('auth');
  const error = urlParams.get('error');
  
  // URL 파라미터 정리 (히스토리 오염 방지)
  if (authSuccess || error) {
    // URL에서 파라미터 제거
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    if (error) {
      console.error('인증 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
      resetToLoginState();
      return;
    }
    
    if (authSuccess === 'success') {
      console.log('OAuth 콜백 성공, 사용자 정보 확인 중...');
      // 약간의 지연 후 인증 상태 확인 (쿠키 설정 완료 대기)
      setTimeout(() => {
        checkAuthStatus();
      }, 1000);
      return;
    }
  }
  
  // DOM 요소 초기화 후 이벤트 리스너 등록
  function setupProfileDropdown() {
    const userAvatar = document.getElementById('user-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutButton = document.getElementById('logout-button');
    
    if (!userAvatar || !profileDropdown || !logoutButton) {
      console.log('프로필 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    const newUserAvatar = userAvatar.cloneNode(true);
    userAvatar.parentNode.replaceChild(newUserAvatar, userAvatar);
    
    const newLogoutButton = logoutButton.cloneNode(true);
    logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
    
    // 새로운 이벤트 리스너 추가
    newUserAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // 로그아웃 버튼 이벤트 리스너 (한 번만 등록)
    newLogoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogout();
    });
    
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
      const currentUserAvatar = document.getElementById('user-avatar');
      if (currentUserAvatar && !currentUserAvatar.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.style.display = 'none';
      }
    });
  }

  // 로그아웃 처리 함수 (중복 실행 방지)
  let isLoggingOut = false;

  function handleLogout() {
    if (isLoggingOut) {
      console.log('이미 로그아웃 진행 중입니다.');
      return;
    }
    
    isLoggingOut = true;
    
    // 즉시 UI 상태 업데이트
    hideUserProfile();
    
    // 가능한 로그아웃 엔드포인트들 시도
    const logoutEndpoints = [
      '/auth/logout',
      '/api/logout', 
      '/api/auth/logout',
      '/logout'
    ];
    
    // 순차적으로 로그아웃 엔드포인트 시도
    tryLogoutEndpoints(logoutEndpoints, 0);
  }

  // 여러 로그아웃 엔드포인트 순차 시도
  async function tryLogoutEndpoints(endpoints, index) {
    if (index >= endpoints.length) {
      // 모든 엔드포인트 실패 시 강제 로그아웃
      console.log('모든 로그아웃 엔드포인트 실패, 강제 로그아웃 실행');
      forceLogout();
      return;
    }
    
    const endpoint = endpoints[index];
    console.log(`로그아웃 시도: ${API_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        console.log(`로그아웃 성공: ${endpoint}`);
        completeLogout();
        return;
      } else if (response.status === 404) {
        console.log(`엔드포인트 없음: ${endpoint}, 다음 시도`);
        // 다음 엔드포인트 시도
        tryLogoutEndpoints(endpoints, index + 1);
        return;
      } else {
        console.log(`로그아웃 실패 (${response.status}): ${endpoint}`);
      }
    } catch (error) {
      console.error(`로그아웃 요청 오류: ${endpoint}`, error);
    }
    
    // 다음 엔드포인트 시도
    tryLogoutEndpoints(endpoints, index + 1);
  }

  // 강제 로그아웃 (API 없이 클라이언트에서만 처리)
  function forceLogout() {
    console.log('강제 로그아웃 실행');
    
    // 1. 모든 로컬 데이터 정리
    clearLocalData();
    
    // 2. 모든 쿠키 삭제
    clearAllCookies();
    
    // 3. 브라우저 캐시 정리 시도
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // 4. 페이지 상태 리셋
    resetToLoginState();
    
    // 5. 강제 새로고침 (캐시 무력화)
    setTimeout(() => {
      // 캐시 무력화를 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      window.location.href = `${window.location.origin}${window.location.pathname}?t=${timestamp}`;
    }, 500);
    
    isLoggingOut = false;
  }

  // 로그아웃 완료 처리
  function completeLogout() {
    // 로컬 데이터 정리
    clearLocalData();
    
    // 쿠키 정리
    clearAllCookies();
    
    // 페이지 상태 리셋
    resetToLoginState();
    
    // 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    isLoggingOut = false;
  }

  // 로그인 상태로 리셋하는 함수
  function resetToLoginState() {
    try {
      // UI 상태 리셋
      if (loginContainer) loginContainer.style.display = 'flex';
      if (serverContainer) serverContainer.style.display = 'none';
      
      // 헤더에서 프로필 표시 제거
      if (headerFrame) headerFrame.classList.remove('with-profile');
      
      // 사용자 프로필 숨기기
      hideUserProfile();
      
      // 로딩 상태 제거
      if (discordLoginButton) discordLoginButton.classList.remove('loading');
      if (serverList) serverList.classList.remove('loading');  
      if (serverLoading) serverLoading.classList.add('hidden');
      
      console.log('로그인 상태로 리셋 완료');
    } catch (error) {
      console.error('상태 리셋 오류:', error);
    }
  }

  // 개선된 쿠키 삭제 함수
  function clearAllCookies() {
    try {
      // 현재 도메인의 모든 쿠키 가져오기
      const cookies = document.cookie.split(";");
      
      // 가능한 모든 도메인과 경로 조합
      const domains = [
        '',  // 현재 도메인
        window.location.hostname,
        `.${window.location.hostname}`,
        'bot-api.soiv-studio.xyz',
        '.soiv-studio.xyz',
        'localhost' // 개발 환경용
      ];
      
      const paths = ['/', '/auth', '/api', '/auth/', '/api/'];
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name) {
          // 기본 삭제
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          
          // 모든 도메인/경로 조합으로 삭제 시도
          domains.forEach(domain => {
            paths.forEach(path => {
              if (domain) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
              }
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
            });
          });
          
          // Secure 쿠키도 삭제 시도
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=none`;
        }
      });
      
      console.log('쿠키 정리 시도 완료');
      
      // 정리 후 남은 쿠키 확인
      setTimeout(() => {
        const remainingCookies = document.cookie;
        if (remainingCookies) {
          console.warn('삭제되지 않은 쿠키:', remainingCookies);
        } else {
          console.log('모든 쿠키 삭제 완료');
        }
      }, 100);
      
    } catch (error) {
      console.error('쿠키 정리 오류:', error);
    }
  }

  // 로컬 데이터 정리 함수 (확장)
  function clearLocalData() {
    try {
      // localStorage 정리
      const localStorageKeys = [
        'authToken', 'accessToken', 'refreshToken', 'token',
        'user', 'userProfile', 'discord_auth', 'session',
        'discordUser', 'auth', 'login', 'authentication'
      ];
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // sessionStorage 정리
      const sessionStorageKeys = [
        'authToken', 'user', 'discord_auth', 'session',
        'discordUser', 'auth'
      ];
      
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      console.log('로컬 데이터 정리 완료');
    } catch (error) {
      console.error('로컬 데이터 정리 오류:', error);
    }
  }

  // 초기 로딩 시 인증 상태 확인
  checkAuthStatus();
  
  // 자동 로그인 설정 불러오기
  const rememberLogin = localStorage.getItem('rememberLogin');
  if (rememberLogin === 'true') {
    rememberLoginCheckbox.checked = true;
  }
  
  // 자동 로그인 설정 저장
  rememberLoginCheckbox.addEventListener('change', function() {
    localStorage.setItem('rememberLogin', this.checked);
  });
  
  // 로그인 버튼 클릭 이벤트
  discordLoginButton.addEventListener('click', function() {
    // 로딩 애니메이션 표시
    discordLoginButton.classList.add('loading');
    
    // 디스코드 OAuth 로그인 URL로 리다이렉트
    setTimeout(() => {
      window.location.href = `${API_URL}/auth/discord`;
    }, 500);
  });
  
  // 로그아웃 함수에 이 코드 추가
  function hideUserProfile() {
    try {
      const userProfile = document.querySelector('.user-profile');
      if (userProfile) {
        userProfile.classList.remove('active');
        userProfile.style.display = 'none';
      }
      
      // 프로필 드롭다운도 숨김
      const profileDropdown = document.getElementById('profile-dropdown');
      if (profileDropdown) {
        profileDropdown.style.display = 'none';
      }
      
      // 사용자 정보 초기화
      const userName = document.getElementById('user-name');
      const userAvatar = document.getElementById('user-avatar');
      
      if (userName) userName.textContent = '';
      if (userAvatar) {
        userAvatar.innerHTML = '';
        userAvatar.style.backgroundColor = '';
        userAvatar.textContent = '';
      }
      
      console.log('사용자 프로필 숨김 완료');
    } catch (error) {
      console.error('사용자 프로필 숨김 오류:', error);
    }
  }
  
  // 인증 상태 확인 함수 (디버깅 강화)
  function checkAuthStatus() {
    console.log('인증 상태 확인 중...');

    // 로딩 상태 표시 추가
    if (discordLoginButton) discordLoginButton.classList.add('loading');

    console.log('현재 쿠키:', document.cookie);
    console.log('현재 도메인:', window.location.hostname);
    console.log('API URL:', API_URL);
    
    // 강제로 캐시 무력화
    const timestamp = new Date().getTime();
    
    fetch(`${API_URL}/api/user?t=${timestamp}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        // 'Expires': '0'
      }
    })
    .then(response => {
      console.log('인증 상태 응답:', response.status);
      console.log('응답 헤더:', [...response.headers.entries()]);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('인증되지 않은 사용자 - 세션/쿠키 문제일 가능성');
          
          // 쿠키 상태 상세 확인
          const cookies = document.cookie.split(';').map(c => c.trim());
          console.log('현재 쿠키 목록:', cookies);
          
          throw new Error('UNAUTHORIZED');
        } else {
          throw new Error(`HTTP ${response.status}: 서버 오류`);
        }
      }
      return response.json();
    })
    .then(data => {
      console.log('사용자 데이터:', data);
      
      if (data.user) {
        console.log('로그인된 사용자:', data.user.username);
        showServerSelectionScreen();
        displayUserProfile(data.user);
      } else {
        throw new Error('사용자 데이터가 없습니다');
      }
    })
    .catch(error => {
      console.log('인증 상태 확인 실패:', error.message);
      
      if (error.message === 'UNAUTHORIZED') {
        console.log('로그인이 필요합니다');
        
        // 디버깅: 세션 테스트 요청
        testSessionEndpoint();
      } else {
        console.error('예상치 못한 오류:', error);
      }

      resetToLoginState();
    });
  }

  // 페이지 로드 시 강제 캐시 정리
  window.addEventListener('load', function() {
    // 브라우저 뒤로가기/앞으로가기 캐시 방지
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        console.log('페이지 캐시에서 복원됨, 새로고침 실행');
        window.location.reload();
      }
    });
  });
  
  // 서버 선택 화면 표시 함수
  function showServerSelectionScreen() {
    // 로그인 버튼 로딩 해제 (인증 성공)
    if (discordLoginButton) discordLoginButton.classList.remove('loading');

    loginContainer.style.display = 'none';
    serverContainer.style.display = 'flex';
    
    // 헤더에 프로필 표시 스타일 적용
    headerFrame.classList.add('with-profile');
    
    // 서버 목록 로딩 시작
    serverList.classList.add('loading');
    
    // 서버 목록 가져오기
    fetchServerList();
  }
  
  // 사용자 프로필 표시 함수
  function displayUserProfile(user) {
    // 프로필 컨테이너 표시
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
      userProfile.classList.add('active');
      userProfile.style.display = 'flex'; // CSS 클래스가 없을 경우 대비
    }

    // 사용자 이름 표시
    if (userName) {
      userName.textContent = user.username;
    }
    
    // 아바타 표시
    if (userAvatar) {
      if (user.avatar) {
        // Discord CDN에서 아바타 이미지 URL 생성
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        userAvatar.innerHTML = `<img src="${avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        // 기본 아바타 색상 (사용자 ID 기반)
        const hue = parseInt(user.id) % 360;
        userAvatar.style.backgroundColor = `hsl(${hue}, 60%, 60%)`;
        userAvatar.innerHTML = ''; // 기존 내용 제거
        
        // 이니셜 표시
        const initial = user.username.charAt(0).toUpperCase();
        userAvatar.textContent = initial;
        userAvatar.style.display = 'flex';
        userAvatar.style.justifyContent = 'center';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.color = 'white';
        userAvatar.style.fontFamily = 'Pretendard, sans-serif';
        userAvatar.style.fontWeight = 'bold';
        userAvatar.style.fontSize = '14px';
      }
    }

    // 프로필 드롭다운 설정
    setupProfileDropdown();
  }
  
  // 서버 목록 가져오기 함수
  function fetchServerList() {
    console.log('서버 목록 가져오는 중...');
    
    // 로딩 표시
    serverLoading.classList.remove('hidden');
    
    fetch(`${API_URL}/api/guilds`, {
      method: 'GET',
      credentials: 'include' // 중요: 쿠키를 포함하여 요청
    })
    .then(response => {
      console.log('서버 목록 응답:', response.status);
      
      if (!response.ok) {
        throw new Error(`서버 목록 가져오기 실패: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('서버 목록 데이터:', data);
      
      // 서버 목록 표시
      displayServerList(data.guilds || []);
      
      // 로딩 상태 제거
      serverList.classList.remove('loading');
      // 로딩 애니메이션 숨기기
      serverLoading.classList.add('hidden');
    })
    .catch(error => {
      console.error('서버 목록 가져오기 오류:', error);
      // 오류 메시지 표시
      serverListContent.innerHTML = `
        <div class="error-message">
          <p>서버 목록을 불러오는데 실패했습니다.</p>
          <button class="retry-button">다시 시도</button>
        </div>
      `;
      
      // 다시 시도 버튼 이벤트 리스너
      const retryButton = document.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', fetchServerList);
      }
      
      // 로딩 상태 제거
      serverList.classList.remove('loading');
      // 로딩 애니메이션 확실히 숨기기
      serverLoading.classList.add('hidden');
    });
  }
  
  // 서버 목록 표시 함수
  function displayServerList(servers) {
    // 기존 목록 초기화
    serverListContent.innerHTML = '';
    
    if (servers.length === 0) {
      // 서버가 없을 경우 메시지 표시
      serverListContent.innerHTML = `
        <div class="no-servers-message">
          <p>관리 권한이 있는 서버가 없습니다.</p>
          <a href="https://discord.com/oauth2/authorize?client_id=${getClientId()}&permissions=8&scope=bot%20applications.commands" class="invite-bot-button" target="_blank">
            봇 초대하기
          </a>
        </div>
      `;
      return;
    }
    
    // 서버 목록 생성
    servers.forEach(server => {
      const serverItem = document.createElement('div');
      serverItem.className = 'server-item';
      serverItem.dataset.serverId = server.id;
      
      const serverIcon = document.createElement('div');
      serverIcon.className = 'server-icon';
      
      // 서버 아이콘이 있으면 표시, 없으면 기본 색상과 이니셜
      if (server.icon) {
        const iconUrl = `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`;
        // 배경 이미지 대신 img 태그 사용
        serverIcon.innerHTML = `<img src="${iconUrl}" alt="${server.name}">`;
      } else {
        // 서버 ID 기반 색상
        const hue = parseInt(server.id) % 360;
        serverIcon.style.backgroundColor = `hsl(${hue}, 60%, 50%)`;
        
        // 이니셜 표시
        const initial = server.name.charAt(0).toUpperCase();
        serverIcon.textContent = initial;
        serverIcon.style.display = 'flex';
        serverIcon.style.justifyContent = 'center';
        serverIcon.style.alignItems = 'center';
        serverIcon.style.color = 'white';
        serverIcon.style.fontFamily = 'Pretendard, sans-serif';
        serverIcon.style.fontWeight = 'bold';
      }
      
      const serverName = document.createElement('div');
      serverName.className = 'server-name';
      serverName.textContent = server.name;
      
      serverItem.appendChild(serverIcon);
      serverItem.appendChild(serverName);
      
      // 서버 클릭 이벤트
      serverItem.addEventListener('click', function() {
        // 모든 서버에서 선택 상태 제거
        document.querySelectorAll('.server-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // 현재 서버 선택 상태 추가
        serverItem.classList.add('selected');
        
        // 서버 페이지로 이동 (약간의 지연으로 선택 효과 보이기)
        setTimeout(() => {
          // 실제 서버 대시보드 페이지 URL
          window.location.href = `/${server.id}/home`;
        }, 300);
      });
      
      serverListContent.appendChild(serverItem);
    });
  }
  
  // 클라이언트 ID 가져오기 (실제로는 .env 파일 또는 설정에서 가져와야 함)
  function getClientId() {
    return '888061096441819166'; // 실제 클라이언트 ID로 변경
  }
});