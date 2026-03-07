const handleError = (error) => {
  if (!error.response) {
    return { message: error.message || 'Opps!! Đã có vài lỗi xảy ra' }
  }

  const { status, data } = error.response
  const serverMessage = data?.error?.message || data?.message

  switch (status) {
    case 400:
      return {
        message:
          serverMessage ||
          'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu đầu vào.',
      }
    case 401:
      return { message: serverMessage || 'Không có quyền truy cập. Vui lòng đăng nhập lại.' }
    case 403:
      return { message: serverMessage || 'Bị cấm. Bạn không có quyền truy cập tài nguyên này.' }
    case 404:
      return { message: serverMessage || 'Không tìm thấy tài nguyên.' }

    case 422: {
      const errorData = data?.error?.details || data?.error?.message || data?.message
      if (
        errorData &&
        typeof errorData === 'object' &&
        !Array.isArray(errorData)
      ) {
        const firstKey = Object.keys(errorData)[0]
        const firstMessage = errorData[firstKey]
        return {
          message: firstMessage || 'Dữ liệu không hợp lệ.',
        }
      }
      return {
        message: typeof errorData === 'string' ? errorData : 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      }
    }

    case 500:
      return { message: serverMessage || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' }
    default:
      return { message: serverMessage || 'Đã xảy ra lỗi không xác định.' }
  }
}

export { handleError }
