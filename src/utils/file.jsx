const nodeEnv = import.meta.env.VITE_NODE_ENV

const baseURL =
  nodeEnv === 'development'
    ? import.meta.env.VITE_SERVER_URL_DEVELOPMENT
    : import.meta.env.VITE_SERVER_URL_PRODUCTION

export const getPublicUrl = (path) => {
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedBase = (baseURL || '').replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBase}/${normalizedPath}`
}
