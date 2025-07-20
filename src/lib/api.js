import axios from 'axios'

const api = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
