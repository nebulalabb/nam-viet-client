export const moneyFormat = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const clean = String(value)
    .trim()
    .replace(/[^0-9.,]/g, '')
    .replace(/\.(?=.*\.)/g, '')
    .replace(/,(?=.*,)/g, '')
    .split(/[.,]/)[0]
  if (!clean) return ''
  return Number(clean).toLocaleString('vi-VN')
}

export const moneyFormatDisplay = (value, withUnit = true) => {
  const formatted = moneyFormat(value)
  if (!formatted) return withUnit ? '0 đ' : '0'
  return withUnit ? `${formatted} đ` : formatted
}

const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín'
const dictionary = {
  units: ('? một' + defaultNumbers).split(' '),
  tens: ('lẻ mười' + defaultNumbers).split(' '),
  hundreds: ('không một' + defaultNumbers).split(' '),
}
const hundred = 'trăm'
const digitUnits = 'x nghìn triệu tỉ nghìn'.split(' ')

// Convert two-digit block to Vietnamese string.
function convertTwoDigitBlock(twoDigitBlock) {
  let unitWord = dictionary.units[twoDigitBlock[1]]
  const result = [dictionary.tens[twoDigitBlock[0]]]
  if (twoDigitBlock[0] > 0 && twoDigitBlock[1] == 5) unitWord = 'lăm'
  if (twoDigitBlock[0] > 1) {
    result.push('mươi')
    if (twoDigitBlock[1] == 1) unitWord = 'mốt'
  }
  if (unitWord !== '?') result.push(unitWord)
  return result.join(' ')
}

// Convert three-digit block to Vietnamese string.
function convertThreeDigitBlock(threeDigitBlock) {
  switch (threeDigitBlock.length) {
    case 1:
      return dictionary.units[threeDigitBlock]
    case 2:
      return convertTwoDigitBlock(threeDigitBlock)
    case 3: {
      const result = [dictionary.hundreds[threeDigitBlock[0]], hundred]
      if (threeDigitBlock.slice(1, 3) !== '00') {
        const lastTwoDigits = convertTwoDigitBlock(threeDigitBlock.slice(1, 3))
        result.push(lastTwoDigits)
      }
      return result.join(' ')
    }
    default:
      return ''
  }
}

// Get the unit of the current digit block.
function getDigitUnit(index) {
  return digitUnits[index]
}

// Convert a number to its Vietnamese string representation.
function toVietnamese(input, currency = 'đồng') {
  const numberString = parseInt(input, 10) + ''
  if (!numberString || numberString === 'NaN') return ''

  let index = numberString.length
  const blocks = []

  // Split the number string into blocks of three digits
  while (index > 0) {
    blocks.push(numberString.slice(Math.max(index - 3, 0), index))
    index -= 3
  }

  const result = []
  let zeroBlockCounter = 0

  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i].padStart(3, '0') // Đảm bảo block đủ 3 chữ số

    if (block === '000') {
      zeroBlockCounter += 1
      if (i === 2 && zeroBlockCounter === 2) {
        result.push(getDigitUnit(i + 1))
      }
    } else {
      zeroBlockCounter = 0
      const blockText = convertThreeDigitBlock(block.replace(/^0+/, '') || '0')
      if (blockText) {
        result.push(blockText)
        const unit = getDigitUnit(i)
        if (unit && unit !== 'x') result.push(unit)
      }
    }
  }

  // Luôn thêm "đồng" nếu có số, hoặc trả về "Không đồng" nếu input = 0
  if (result.length === 0) {
    result.push('không')
  }
  result.push(currency)

  return capitalizeFirstLetter(result.join(' ').trim())
}

const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1)
  return capitalized.endsWith('.') ? capitalized : capitalized + '.'
}

export { toVietnamese }
