const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const normalizeFloatString = (v) => {
  if (v === null || v === undefined) return ''
  let s = String(v).trim()
  if (!s) return ''

  // normalize decimal separator
  s = s.replace(/,/g, '.')

  // nếu là số hợp lệ thì trim trailing zeros sau dấu .
  if (s.includes('.')) {
    s = s
      .replace(/(\.\d*?[1-9])0+$/g, '$1') // 2.500000 -> 2.5
      .replace(/\.0+$/g, '') // 2.000000 -> 2
  }

  return s
}

export { normalizeText, normalizeFloatString }