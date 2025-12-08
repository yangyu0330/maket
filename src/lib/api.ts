import axios from 'axios'

// 1. 환경 변수에서 API 기본 URL을 가져옵니다.
//    Vite 환경에서 프론트엔드가 사용할 환경 변수는 VITE_ 접두사가 필요하며,
//    백엔드 API가 같은 도메인의 /api 경로로 배포될 경우 '/api'를 기본값으로 사용합니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
// 로컬 개발 환경(npm run dev)에서 .env 파일에 VITE_API_BASE_URL=http://localhost:5000/api 를 설정하거나
// Vercel 환경 변수를 `/api`로 설정하여 사용해야 합니다.

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 (토큰 자동 포함)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
