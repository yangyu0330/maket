import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Node 서버 주소
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
