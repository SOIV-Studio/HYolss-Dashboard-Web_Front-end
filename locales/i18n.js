// i18n.js - 리팩토링된 다국어 지원 시스템

// 지원 언어 목록
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'];
const DEFAULT_LANGUAGE = 'ko';

// 로드된 번역 데이터 캐시
const translationCache = new Map();

// 현재 언어 설정
let currentLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;

/**
 * 언어 파일을 동적으로 로드하는 함수
 * @param {string} lang - 로드할 언어 코드
 * @returns {Promise<Object>} 번역 데이터 객체
 */
async function loadLanguage(lang) {
  // 이미 캐시에 있으면 반환
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }

  try {
    // 언어 파일 경로 설정 (실제 프로젝트 구조에 맞게 조정)
    const response = await fetch(`./locales/${lang}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load language file: ${lang}`);
    }
    
    const translations = await response.json();
    
    // 캐시에 저장
    translationCache.set(lang, translations);
    
    console.log(`Language loaded: ${lang}`);
    return translations;
    
  } catch (error) {
    console.error(`Error loading language ${lang}:`, error);
    
    // 기본 언어로 폴백
    if (lang !== DEFAULT_LANGUAGE) {
      console.log(`Falling back to default language: ${DEFAULT_LANGUAGE}`);
      return loadLanguage(DEFAULT_LANGUAGE);
    }
    
    // 기본 언어도 실패하면 빈 객체 반환
    return {};
  }
}

/**
 * 중첩된 객체에서 키 경로로 값을 가져오는 함수
 * @param {Object} obj - 대상 객체
 * @param {string} path - 점으로 구분된 키 경로 (예: 'login.with.discord')
 * @returns {string|undefined} 찾은 값 또는 undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * 번역 텍스트를 가져오는 함수
 * @param {string} key - 번역 키 (점 표기법 지원)
 * @param {Object} params - 템플릿 매개변수 (선택사항)
 * @returns {string} 번역된 텍스트 또는 키
 */
function t(key, params = {}) {
  const translations = translationCache.get(currentLanguage);
  
  if (!translations) {
    console.warn(`Translations not loaded for language: ${currentLanguage}`);
    return key;
  }
  
  // 중첩된 키 지원 (예: 'login.with.discord')
  let translation = getNestedValue(translations, key);
  
  // 번역이 없으면 키 반환
  if (translation === undefined) {
    console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
    return key;
  }
  
  // 템플릿 매개변수 치환
  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    translation = translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return translation;
}

/**
 * 언어를 변경하는 함수
 * @param {string} lang - 변경할 언어 코드
 * @returns {Promise<boolean>} 성공 여부
 */
async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    console.error(`Unsupported language: ${lang}`);
    return false;
  }
  
  try {
    // 언어 파일 로드
    await loadLanguage(lang);
    
    // 현재 언어 설정
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // 페이지 번역 업데이트
    updatePageTranslations();
    
    console.log(`Language changed to: ${lang}`);
    return true;
    
  } catch (error) {
    console.error(`Failed to set language to ${lang}:`, error);
    return false;
  }
}

/**
 * 페이지의 모든 번역 요소를 업데이트하는 함수
 */
function updatePageTranslations() {
  // data-i18n 속성을 가진 모든 요소에 번역 적용
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const params = element.getAttribute('data-i18n-params');
    
    let translationParams = {};
    if (params) {
      try {
        translationParams = JSON.parse(params);
      } catch (e) {
        console.warn('Invalid i18n params:', params);
      }
    }
    
    const translatedText = t(key, translationParams);
    
    // 요소 타입에 따라 다르게 적용
    if (element.tagName === 'INPUT') {
      if (element.type === 'text' || element.type === 'email' || element.type === 'password') {
        element.placeholder = translatedText;
      } else if (element.type === 'submit' || element.type === 'button') {
        element.value = translatedText;
      }
    } else if (element.tagName === 'IMG') {
      element.alt = translatedText;
    } else if (element.tagName === 'META') {
      element.content = translatedText;
    } else {
      element.textContent = translatedText;
    }
  });
  
  // 언어 선택기 업데이트
  const languageSelector = document.getElementById('language-setting');
  if (languageSelector) {
    languageSelector.value = currentLanguage;
  }
  
  // HTML lang 속성 업데이트
  document.documentElement.lang = currentLanguage;
  
  // 언어 변경 이벤트 발생
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { 
      language: currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES
    } 
  }));
}

/**
 * 다국어 시스템을 초기화하는 함수
 */
async function initializeI18n() {
  try {
    // 저장된 언어 설정 확인
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      currentLanguage = savedLanguage;
    }
    
    // 현재 언어 파일 로드
    await loadLanguage(currentLanguage);
    
    // 언어 선택기 설정
    const languageSelector = document.getElementById('language-setting');
    if (languageSelector) {
      languageSelector.value = currentLanguage;
      languageSelector.addEventListener('change', async function() {
        const success = await setLanguage(this.value);
        if (!success) {
          // 실패 시 이전 값으로 되돌리기
          this.value = currentLanguage;
        }
      });
    }
    
    // 초기 페이지 번역 적용
    updatePageTranslations();
    
    console.log('i18n system initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize i18n system:', error);
  }
}

/**
 * 현재 언어를 가져오는 함수
 * @returns {string} 현재 언어 코드
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 지원하는 언어 목록을 가져오는 함수
 * @returns {Array<string>} 지원 언어 코드 배열
 */
function getSupportedLanguages() {
  return [...SUPPORTED_LANGUAGES];
}

/**
 * 특정 언어가 로드되었는지 확인하는 함수
 * @param {string} lang - 확인할 언어 코드
 * @returns {boolean} 로드 여부
 */
function isLanguageLoaded(lang) {
  return translationCache.has(lang);
}

// DOM이 로드된 후 자동 초기화
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeI18n);
}

// 공개 API 내보내기
export { 
  t, 
  setLanguage, 
  getCurrentLanguage,
  getSupportedLanguages,
  isLanguageLoaded,
  loadLanguage,
  initializeI18n,
  updatePageTranslations
};