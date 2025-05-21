document.addEventListener('DOMContentLoaded', function() {
  // 백엔드 서버 URL
  const API_URL = 'https://bot-api.soiv-studio.xyz';
  
  // DOM 요소 - 대시보드 관련
  const dashboardContainer = document.getElementById('dashboard-container');
  const serverNameTitle = document.getElementById('server-name-title');
  const navButtons = document.querySelectorAll('.nav-button');
  const dashboardSections = document.querySelectorAll('.dashboard-section');
  
  // 통계 요소
  const memberCountElement = document.getElementById('member-count');
  const commandUsageElement = document.getElementById('command-usage');
  const activeFeaturesElement = document.getElementById('active-features');
  
  // 현재 선택된 서버 ID
  let currentServerId = null;
  let currentServerName = null;
  
  // URL에서 서버 ID 가져오기
  function getServerIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const serverIndex = pathParts.indexOf('server');
    
    if (serverIndex !== -1 && pathParts.length > serverIndex + 1) {
      return pathParts[serverIndex + 1];
    }
    
    return null;
  }
  
  // 초기화 함수
  function initDashboard() {
    const serverId = getServerIdFromUrl();
    
    if (serverId) {
      currentServerId = serverId;
      loadServerDashboard(serverId);
    }
    
    // 네비게이션 버튼 이벤트 리스너
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        // 활성 버튼 변경
        navButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // 해당 섹션 표시
        const sectionId = this.getAttribute('data-section');
        dashboardSections.forEach(section => {
          section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
        
        // 섹션별 데이터 로드
        if (currentServerId) {
          switch(sectionId) {
            case 'commands':
              loadCommands(currentServerId);
              break;
            case 'logs':
              loadLogs(currentServerId);
              break;
            case 'settings':
              loadSettings(currentServerId);
              break;
          }
        }
      });
    });
    
    // 설정 저장 버튼 이벤트 리스너
    const saveSettingsButton = document.getElementById('save-settings');
    if (saveSettingsButton) {
      saveSettingsButton.addEventListener('click', function() {
        saveServerSettings(currentServerId);
      });
    }
    
    // 로그 필터 적용 버튼 이벤트 리스너
    const applyLogFilterButton = document.getElementById('apply-log-filter');
    if (applyLogFilterButton) {
      applyLogFilterButton.addEventListener('click', function() {
        loadLogs(currentServerId);
      });
    }
    
    // 빠른 작업 버튼 이벤트 리스너
    setupQuickActionButtons();
  }
  
  // 대시보드 로드 함수
  function loadServerDashboard(serverId) {
    // 서버 정보 가져오기
    fetch(`${API_URL}/api/servers/${serverId}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('서버 정보를 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 서버 정보 표시
      currentServerName = data.server.name;
      serverNameTitle.textContent = currentServerName;
      
      // 서버 컨테이너 숨기고 대시보드 표시
      const serverContainer = document.getElementById('server-container');
      if (serverContainer) {
        serverContainer.style.display = 'none';
      }
      dashboardContainer.style.display = 'block';
      
      // 서버 통계 표시
      displayServerStats(data.server);
      
      // 명령어 목록 불러오기
      loadCommands(serverId);
      
      // 설정 불러오기
      loadSettings(serverId);
    })
    .catch(error => {
      console.error('대시보드 로드 오류:', error);
      
      // 오류 발생 시 서버 선택 화면으로 돌아가기
      alert('서버 정보를 불러오는데 실패했습니다. 서버 선택 화면으로 돌아갑니다.');
      window.location.href = '/';
    });
  }
  
  // 서버 통계 표시 함수
  function displayServerStats(server) {
    // 통계 정보 표시
    if (memberCountElement) {
      memberCountElement.textContent = server.memberCount || '0';
    }
    
    if (commandUsageElement) {
      commandUsageElement.textContent = server.commandUsage || '0';
    }
    
    if (activeFeaturesElement) {
      activeFeaturesElement.textContent = server.activeFeatures || '0';
    }
  }
  
  // 명령어 목록 로드 함수
  function loadCommands(serverId) {
    const commandsList = document.getElementById('commands-list');
    
    if (!commandsList) return;
    
    // 로딩 텍스트 표시
    commandsList.innerHTML = '<div class="loading-text">명령어 목록을 불러오는 중...</div>';
    
    // 명령어 목록 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/commands`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('명령어 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 명령어 목록 표시
      displayCommands(data.commands, commandsList);
    })
    .catch(error => {
      console.error('명령어 목록 로드 오류:', error);
      commandsList.innerHTML = '<div class="error-message">명령어 목록을 불러오는데 실패했습니다.</div>';
    });
  }
  
  // 명령어 목록 표시 함수
  function displayCommands(commands, container) {
    // 컨테이너 초기화
    container.innerHTML = '';
    
    if (!commands || commands.length === 0) {
      container.innerHTML = '<div class="empty-message">사용 가능한 명령어가 없습니다.</div>';
      return;
    }
    
    // 명령어 카테고리별로 그룹화
    const commandsByCategory = {};
    
    commands.forEach(command => {
      if (!commandsByCategory[command.category]) {
        commandsByCategory[command.category] = [];
      }
      commandsByCategory[command.category].push(command);
    });
    
    // 카테고리별로 명령어 표시
    Object.keys(commandsByCategory).forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'command-category';
      
      const categoryHeader = document.createElement('h4');
      categoryHeader.textContent = category;
      categoryDiv.appendChild(categoryHeader);
      
      const commandsInCategory = commandsByCategory[category];
      
      // 명령어 목록 생성
      const commandsList = document.createElement('div');
      commandsList.className = 'commands-in-category';
      
      commandsInCategory.forEach(command => {
        const commandItem = document.createElement('div');
        commandItem.className = 'command-item';
        
        // 명령어 활성화 상태 토글 스위치
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'command-toggle';
        
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'switch';
        
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = command.enabled;
        toggleInput.dataset.commandId = command.id;
        toggleInput.addEventListener('change', function() {
          toggleCommand(currentServerId, command.id, this.checked);
        });
        
        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'slider';
        
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleSlider);
        toggleDiv.appendChild(toggleLabel);
        
        // 명령어 정보
        const commandInfo = document.createElement('div');
        commandInfo.className = 'command-info';
        
        const commandName = document.createElement('div');
        commandName.className = 'command-name';
        commandName.textContent = command.name;
        
        const commandDescription = document.createElement('div');
        commandDescription.className = 'command-description';
        commandDescription.textContent = command.description;
        
        commandInfo.appendChild(commandName);
        commandInfo.appendChild(commandDescription);
        
        // 요소 조합
        commandItem.appendChild(toggleDiv);
        commandItem.appendChild(commandInfo);
        
        commandsList.appendChild(commandItem);
      });
      
      categoryDiv.appendChild(commandsList);
      container.appendChild(categoryDiv);
    });
  }
  
  // 명령어 토글 함수
  function toggleCommand(serverId, commandId, enabled) {
    fetch(`${API_URL}/api/servers/${serverId}/commands/${commandId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ enabled })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('명령어 상태 변경에 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      console.log('명령어 상태 변경됨:', data);
    })
    .catch(error => {
      console.error('명령어 토글 오류:', error);
      alert('명령어 상태 변경에 실패했습니다. 다시 시도해주세요.');
      // 실패 시 체크박스 상태 되돌리기
      const checkbox = document.querySelector(`input[data-command-id="${commandId}"]`);
      if (checkbox) {
        checkbox.checked = !enabled;
      }
    });
  }
  
  // 설정 로드 함수
  function loadSettings(serverId) {
    // 설정 요소
    const prefixSetting = document.getElementById('prefix-setting');
    const languageSetting = document.getElementById('language-setting');
    const welcomeModule = document.getElementById('welcome-module');
    const moderationModule = document.getElementById('moderation-module');
    const autoRoleModule = document.getElementById('auto-role-module');
    const loggingModule = document.getElementById('logging-module');
    
    // 설정 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/settings`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('설정을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 설정 적용
      if (prefixSetting) prefixSetting.value = data.settings.prefix || '!';
      if (languageSetting) languageSetting.value = data.settings.language || 'ko';
      
      // 모듈 활성화 상태
      if (welcomeModule) welcomeModule.checked = data.settings.modules.welcome || false;
      if (moderationModule) moderationModule.checked = data.settings.modules.moderation || false;
      if (autoRoleModule) autoRoleModule.checked = data.settings.modules.autoRole || false;
      if (loggingModule) loggingModule.checked = data.settings.modules.logging || false;
    })
    .catch(error => {
      console.error('설정 로드 오류:', error);
      alert('설정을 불러오는데 실패했습니다.');
    });
  }
  
  // 설정 저장 함수
  function saveServerSettings(serverId) {
    // 설정 요소
    const prefixSetting = document.getElementById('prefix-setting');
    const languageSetting = document.getElementById('language-setting');
    const welcomeModule = document.getElementById('welcome-module');
    const moderationModule = document.getElementById('moderation-module');
    const autoRoleModule = document.getElementById('auto-role-module');
    const loggingModule = document.getElementById('logging-module');
    
    // 설정 객체 생성
    const settings = {
      prefix: prefixSetting ? prefixSetting.value : '!',
      language: languageSetting ? languageSetting.value : 'ko',
      modules: {
        welcome: welcomeModule ? welcomeModule.checked : false,
        moderation: moderationModule ? moderationModule.checked : false,
        autoRole: autoRoleModule ? autoRoleModule.checked : false,
        logging: loggingModule ? loggingModule.checked : false
      }
    };
    
    // 설정 저장 요청
    fetch(`${API_URL}/api/servers/${serverId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('설정 저장에 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      alert('설정이 성공적으로 저장되었습니다.');
    })
    .catch(error => {
      console.error('설정 저장 오류:', error);
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    });
  }
  
  // 로그 로드 함수
  function loadLogs(serverId) {
    const logsBody = document.getElementById('logs-body');
    
    if (!logsBody) return;
    
    // 로딩 텍스트 표시
    logsBody.innerHTML = '<tr><td colspan="4" class="loading-text">로그를 불러오는 중...</td></tr>';
    
    // 필터 값 가져오기
    const typeFilter = document.getElementById('log-type-filter').value;
    const dateFilter = document.getElementById('log-date-filter').value;
    
    // 로그 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/logs?type=${typeFilter}&date=${dateFilter}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('로그를 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 로그 표시
      displayLogs(data.logs, logsBody);
    })
    .catch(error => {
      console.error('로그 로드 오류:', error);
      logsBody.innerHTML = '<tr><td colspan="4" class="error-message">로그를 불러오는데 실패했습니다.</td></tr>';
    });
  }
  
  // 로그 표시 함수
  function displayLogs(logs, container) {
    // 컨테이너 초기화
    container.innerHTML = '';
    
    if (!logs || logs.length === 0) {
      container.innerHTML = '<tr><td colspan="4" class="empty-message">표시할 로그가 없습니다.</td></tr>';
      return;
    }
    
    // 로그 항목 생성
    logs.forEach(log => {
      const logRow = document.createElement('tr');
      
      // 시간
      const timeCell = document.createElement('td');
      const logDate = new Date(log.timestamp);
      timeCell.textContent = logDate.toLocaleString('ko-KR');
      
      // 유형
      const typeCell = document.createElement('td');
      typeCell.textContent = getLogTypeText(log.type);
      typeCell.className = `log-type-${log.type}`;
      
      // 사용자
      const userCell = document.createElement('td');
      userCell.textContent = log.user || '-';
      
      // 내용
      const contentCell = document.createElement('td');
      contentCell.textContent = log.content;
      
      // 요소 조합
      logRow.appendChild(timeCell);
      logRow.appendChild(typeCell);
      logRow.appendChild(userCell);
      logRow.appendChild(contentCell);
      
      container.appendChild(logRow);
    });
  }
  
  // 로그 유형 텍스트 변환 함수
  function getLogTypeText(type) {
    switch(type) {
      case 'commands':
        return '명령어';
      case 'moderation':
        return '관리';
      case 'members':
        return '멤버';
      default:
        return type;
    }
  }
  
  // 빠른 작업 버튼 설정 함수
  function setupQuickActionButtons() {
    // 환영 메시지 설정 버튼
    const welcomeSetupButton = document.getElementById('welcome-setup');
    if (welcomeSetupButton) {
      welcomeSetupButton.addEventListener('click', function() {
        showWelcomeSetup();
      });
    }
    
    // 자동 역할 관리 버튼
    const autoRolesButton = document.getElementById('auto-roles');
    if (autoRolesButton) {
      autoRolesButton.addEventListener('click', function() {
        showAutoRolesSetup();
      });
    }
    
    // 관리 시스템 설정 버튼
    const moderationSetupButton = document.getElementById('moderation-setup');
    if (moderationSetupButton) {
      moderationSetupButton.addEventListener('click', function() {
        showModerationSetup();
      });
    }
  }
  
  // 환영 메시지 설정 모달 표시 함수
  function showWelcomeSetup() {
    // 모달 생성 및 표시 로직
    const modal = createModal('환영 메시지 설정', `
      <div class="welcome-setup-form">
        <div class="setting-item">
          <label for="welcome-channel">환영 채널</label>
          <select id="welcome-channel">
            <option value="">채널 선택...</option>
            <!-- 채널 목록은 동적으로 추가됩니다 -->
          </select>
        </div>
        <div class="setting-item">
          <label for="welcome-message">환영 메시지</label>
          <textarea id="welcome-message" placeholder="환영 메시지를 입력하세요. {user}는 사용자 멘션으로 대체됩니다."></textarea>
        </div>
        <button id="save-welcome-settings" class="modal-action-button">저장</button>
      </div>
    `);
    
    // 모달 표시
    document.body.appendChild(modal);
    
    // 채널 목록 불러오기
    loadChannelList(currentServerId, 'welcome-channel');
    
    // 현재 환영 메시지 설정 불러오기
    loadWelcomeSettings(currentServerId);
    
    // 저장 버튼 이벤트 리스너
    document.getElementById('save-welcome-settings').addEventListener('click', function() {
      saveWelcomeSettings(currentServerId);
    });
  }
  
  // 자동 역할 설정 모달 표시 함수
  function showAutoRolesSetup() {
    // 모달 생성 및 표시 로직
    const modal = createModal('자동 역할 설정', `
      <div class="auto-roles-setup-form">
        <div class="setting-item">
          <label>자동 역할 활성화</label>
          <label class="switch">
            <input type="checkbox" id="auto-role-enabled">
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <label for="auto-roles-list">자동 지급할 역할</label>
          <div id="auto-roles-list" class="roles-list">
            <!-- 역할 목록은 동적으로 추가됩니다 -->
            <div class="loading-text">역할 목록을 불러오는 중...</div>
          </div>
        </div>
        <button id="save-auto-roles" class="modal-action-button">저장</button>
      </div>
    `);
    
    // 모달 표시
    document.body.appendChild(modal);
    
    // 역할 목록 불러오기
    loadRolesList(currentServerId);
    
    // 현재 자동 역할 설정 불러오기
    loadAutoRoleSettings(currentServerId);
    
    // 저장 버튼 이벤트 리스너
    document.getElementById('save-auto-roles').addEventListener('click', function() {
      saveAutoRoleSettings(currentServerId);
    });
  }
  
  // 관리 시스템 설정 모달 표시 함수
  function showModerationSetup() {
    // 모달 생성 및 표시 로직
    const modal = createModal('관리 시스템 설정', `
      <div class="moderation-setup-form">
        <div class="setting-item">
          <label>관리 로깅 활성화</label>
          <label class="switch">
            <input type="checkbox" id="mod-logging-enabled">
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <label for="mod-log-channel">관리 로그 채널</label>
          <select id="mod-log-channel">
            <option value="">채널 선택...</option>
            <!-- 채널 목록은 동적으로 추가됩니다 -->
          </select>
        </div>
        <div class="setting-item">
          <label>자동 경고 기능</label>
          <label class="switch">
            <input type="checkbox" id="auto-warn-enabled">
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <label for="warn-threshold">경고 임계값 (제재 적용)</label>
          <input type="number" id="warn-threshold" min="1" max="10" value="3">
        </div>
        <button id="save-mod-settings" class="modal-action-button">저장</button>
      </div>
    `);
    
    // 모달 표시
    document.body.appendChild(modal);
    
    // 채널 목록 불러오기
    loadChannelList(currentServerId, 'mod-log-channel');
    
    // 현재 관리 시스템 설정 불러오기
    loadModerationSettings(currentServerId);
    
    // 저장 버튼 이벤트 리스너
    document.getElementById('save-mod-settings').addEventListener('click', function() {
      saveModerationSettings(currentServerId);
    });
  }
  
  // 모달 생성 함수
  function createModal(title, content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
      document.body.removeChild(modalOverlay);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;
    
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalContent);
    modalOverlay.appendChild(modalContainer);
    
    // 모달 외부 클릭 시 닫기
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
    
    return modalOverlay;
  }
  
  // 채널 목록 불러오기 함수
  function loadChannelList(serverId, selectElementId) {
    const channelSelect = document.getElementById(selectElementId);
    
    if (!channelSelect) return;
    
    // 채널 목록 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/channels`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('채널 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 채널 옵션 추가
      data.channels.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.textContent = `#${channel.name}`;
        channelSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('채널 목록 로드 오류:', error);
      channelSelect.innerHTML = '<option value="">채널 로드 실패</option>';
    });
  }
  
  // 역할 목록 불러오기 함수
  function loadRolesList(serverId) {
    const rolesListContainer = document.getElementById('auto-roles-list');
    
    if (!rolesListContainer) return;
    
    // 역할 목록 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/roles`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('역할 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 역할 목록 컨테이너 초기화
      rolesListContainer.innerHTML = '';
      
      // 역할이 없을 경우
      if (!data.roles || data.roles.length === 0) {
        rolesListContainer.innerHTML = '<div class="empty-message">표시할 역할이 없습니다.</div>';
        return;
      }
      
      // 역할 목록 생성
      data.roles.forEach(role => {
        // @everyone 역할 건너뛰기
        if (role.name === '@everyone') return;
        
        const roleItem = document.createElement('div');
        roleItem.className = 'role-item';
        
        const roleCheckbox = document.createElement('input');
        roleCheckbox.type = 'checkbox';
        roleCheckbox.id = `role-${role.id}`;
        roleCheckbox.dataset.roleId = role.id;
        
        const roleLabel = document.createElement('label');
        roleLabel.htmlFor = `role-${role.id}`;
        
        // 역할 색상 표시
        const roleColor = document.createElement('span');
        roleColor.className = 'role-color';
        roleColor.style.backgroundColor = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99AAB5';
        
        const roleName = document.createElement('span');
        roleName.className = 'role-name';
        roleName.textContent = role.name;
        
        roleLabel.appendChild(roleColor);
        roleLabel.appendChild(roleName);
        
        roleItem.appendChild(roleCheckbox);
        roleItem.appendChild(roleLabel);
        
        rolesListContainer.appendChild(roleItem);
      });
    })
    .catch(error => {
      console.error('역할 목록 로드 오류:', error);
      rolesListContainer.innerHTML = '<div class="error-message">역할 목록을 불러오는데 실패했습니다.</div>';
    });
  }
  
  // 환영 메시지 설정 불러오기 함수
  function loadWelcomeSettings(serverId) {
    // 환영 메시지 설정 요소
    const welcomeChannelSelect = document.getElementById('welcome-channel');
    const welcomeMessageTextarea = document.getElementById('welcome-message');
    
    if (!welcomeChannelSelect || !welcomeMessageTextarea) return;
    
    // 설정 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/welcome-settings`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('환영 메시지 설정을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 환영 메시지 설정 적용
      if (data.settings) {
        welcomeChannelSelect.value = data.settings.channelId || '';
        welcomeMessageTextarea.value = data.settings.message || '';
      }
    })
    .catch(error => {
      console.error('환영 메시지 설정 로드 오류:', error);
      alert('환영 메시지 설정을 불러오는데 실패했습니다.');
    });
  }
  
  // 환영 메시지 설정 저장 함수
  function saveWelcomeSettings(serverId) {
    // 환영 메시지 설정 요소
    const welcomeChannelSelect = document.getElementById('welcome-channel');
    const welcomeMessageTextarea = document.getElementById('welcome-message');
    
    if (!welcomeChannelSelect || !welcomeMessageTextarea) return;
    
    // 설정 데이터 생성
    const settings = {
      channelId: welcomeChannelSelect.value,
      message: welcomeMessageTextarea.value
    };
    
    // 설정 저장 요청
    fetch(`${API_URL}/api/servers/${serverId}/welcome-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('환영 메시지 설정 저장에 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      alert('환영 메시지 설정이 성공적으로 저장되었습니다.');
      
      // 모달 닫기
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
      }
      
      // 웰컴 모듈 활성화
      const welcomeModule = document.getElementById('welcome-module');
      if (welcomeModule) {
        welcomeModule.checked = true;
      }
    })
    .catch(error => {
      console.error('환영 메시지 설정 저장 오류:', error);
      alert('환영 메시지 설정 저장에 실패했습니다. 다시 시도해주세요.');
    });
  }
  
  // 자동 역할 설정 불러오기 함수
  function loadAutoRoleSettings(serverId) {
    // 자동 역할 설정 요소
    const autoRoleEnabled = document.getElementById('auto-role-enabled');
    
    if (!autoRoleEnabled) return;
    
    // 설정 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/auto-role-settings`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('자동 역할 설정을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 자동 역할 활성화 상태 설정
      autoRoleEnabled.checked = data.settings.enabled || false;
      
      // 자동 역할 목록 체크박스 설정
      if (data.settings.roles && data.settings.roles.length > 0) {
        data.settings.roles.forEach(roleId => {
          const checkbox = document.querySelector(`input[data-role-id="${roleId}"]`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
    })
    .catch(error => {
      console.error('자동 역할 설정 로드 오류:', error);
      alert('자동 역할 설정을 불러오는데 실패했습니다.');
    });
  }
  
  // 자동 역할 설정 저장 함수
  function saveAutoRoleSettings(serverId) {
    // 자동 역할 설정 요소
    const autoRoleEnabled = document.getElementById('auto-role-enabled');
    
    if (!autoRoleEnabled) return;
    
    // 선택된 역할 ID 수집
    const selectedRoles = [];
    document.querySelectorAll('#auto-roles-list input[type="checkbox"]:checked').forEach(checkbox => {
      selectedRoles.push(checkbox.dataset.roleId);
    });
    
    // 설정 데이터 생성
    const settings = {
      enabled: autoRoleEnabled.checked,
      roles: selectedRoles
    };
    
    // 설정 저장 요청
    fetch(`${API_URL}/api/servers/${serverId}/auto-role-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('자동 역할 설정 저장에 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      alert('자동 역할 설정이 성공적으로 저장되었습니다.');
      
      // 모달 닫기
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
      }
      
      // 자동 역할 모듈 활성화
      const autoRoleModule = document.getElementById('auto-role-module');
      if (autoRoleModule) {
        autoRoleModule.checked = true;
      }
    })
    .catch(error => {
      console.error('자동 역할 설정 저장 오류:', error);
      alert('자동 역할 설정 저장에 실패했습니다. 다시 시도해주세요.');
    });
  }
  
  // 관리 시스템 설정 불러오기 함수
  function loadModerationSettings(serverId) {
    // 관리 시스템 설정 요소
    const modLoggingEnabled = document.getElementById('mod-logging-enabled');
    const modLogChannel = document.getElementById('mod-log-channel');
    const autoWarnEnabled = document.getElementById('auto-warn-enabled');
    const warnThreshold = document.getElementById('warn-threshold');
    
    if (!modLoggingEnabled || !modLogChannel || !autoWarnEnabled || !warnThreshold) return;
    
    // 설정 가져오기
    fetch(`${API_URL}/api/servers/${serverId}/moderation-settings`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('관리 시스템 설정을 불러오는데 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      // 관리 시스템 설정 적용
      if (data.settings) {
        modLoggingEnabled.checked = data.settings.loggingEnabled || false;
        modLogChannel.value = data.settings.logChannelId || '';
        autoWarnEnabled.checked = data.settings.autoWarnEnabled || false;
        warnThreshold.value = data.settings.warnThreshold || 3;
      }
    })
    .catch(error => {
      console.error('관리 시스템 설정 로드 오류:', error);
      alert('관리 시스템 설정을 불러오는데 실패했습니다.');
    });
  }
  
  // 관리 시스템 설정 저장 함수
  function saveModerationSettings(serverId) {
    // 관리 시스템 설정 요소
    const modLoggingEnabled = document.getElementById('mod-logging-enabled');
    const modLogChannel = document.getElementById('mod-log-channel');
    const autoWarnEnabled = document.getElementById('auto-warn-enabled');
    const warnThreshold = document.getElementById('warn-threshold');
    
    if (!modLoggingEnabled || !modLogChannel || !autoWarnEnabled || !warnThreshold) return;
    
    // 설정 데이터 생성
    const settings = {
      loggingEnabled: modLoggingEnabled.checked,
      logChannelId: modLogChannel.value,
      autoWarnEnabled: autoWarnEnabled.checked,
      warnThreshold: parseInt(warnThreshold.value, 10) || 3
    };
    
    // 설정 저장 요청
    fetch(`${API_URL}/api/servers/${serverId}/moderation-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('관리 시스템 설정 저장에 실패했습니다');
      }
      return response.json();
    })
    .then(data => {
      alert('관리 시스템 설정이 성공적으로 저장되었습니다.');
      
      // 모달 닫기
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
      }
      
      // 관리 모듈 활성화
      const moderationModule = document.getElementById('moderation-module');
      if (moderationModule) {
        moderationModule.checked = true;
      }
    })
    .catch(error => {
      console.error('관리 시스템 설정 저장 오류:', error);
      alert('관리 시스템 설정 저장에 실패했습니다. 다시 시도해주세요.');
    });
  }
  
  // 초기화 함수 호출
  initDashboard();
});