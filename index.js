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
  
  // DOM 요소 초기화 후 이벤트 리스너 등록
  function setupProfileDropdown() {
    const userAvatar = document.getElementById('user-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (!userAvatar || !profileDropdown) {
      console.log('프로필 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    userAvatar.replaceWith(userAvatar.cloneNode(true));
    const newUserAvatar = document.getElementById('user-avatar');
    
    // 새로운 이벤트 리스너 추가
    newUserAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
      if (!newUserAvatar.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.style.display = 'none';
      }
    });
  }

  // 로그인 상태 체크
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
  
  // 프로필 아바타 클릭 시 드롭다운 토글
  if (userAvatar) {
    userAvatar.addEventListener('click', function(e) {
      e.stopPropagation(); // 이벤트 버블링 방지
      profileDropdown.classList.toggle('active');
    });
  }
  
  // 다른 곳 클릭 시 드롭다운 닫기
  document.addEventListener('click', function() {
    if (profileDropdown && profileDropdown.classList.contains('active')) {
      profileDropdown.classList.remove('active');
    }
  });
  
  // 로그아웃 함수에 이 코드 추가
  function hideUserProfile() {
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
  }

  // 로그아웃 버튼 이벤트에서 호출
  logoutButton.addEventListener('click', function() {
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    .then(() => {
      hideUserProfile(); // 프로필 숨김
      window.location.reload();
    })
    .catch(error => {
      console.error('로그아웃 오류:', error);
      hideUserProfile(); // 오류 시에도 프로필 숨김
      window.location.reload();
    });
  });
  
  // 인증 상태 확인 함수
  function checkAuthStatus() {
    // 항상 인증 상태 확인 (자동 로그인 체크와 상관없이)
    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('인증되지 않음');
      }
      return response.json();
    })
    .then(data => {
      if (data.user) {
        showServerSelectionScreen();
        displayUserProfile(data.user);
      }
    })
    .catch(error => {
      console.log('인증 상태 확인 오류:', error);
    });
  }
  
  // 서버 선택 화면 표시 함수
  function showServerSelectionScreen() {
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
    // 로딩 표시
    serverLoading.classList.remove('hidden');
    
    fetch(`${API_URL}/api/guilds`, {
      method: 'GET',
      credentials: 'include' // 중요: 쿠키를 포함하여 요청
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('서버 목록을 가져오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 서버 목록 표시
      displayServerList(data.guilds);
      
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
      document.querySelector('.retry-button').addEventListener('click', fetchServerList);
      
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
    return '888061096441819166'; // 이 부분은 실제 Discord 애플리케이션 ID로 대체해야 함
  }
});