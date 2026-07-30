import axios from 'axios'
import type { ApiResponse } from '../types/auth'

export function getApiErrorMessage(response?: Pick<ApiResponse<unknown>, 'message' | 'errors'> | null) {
  if (!response) {
    return 'Something went wrong. Please try again.'
  }

  if (response.errors?.length) {
    return response.errors.join('\n')
  }

  return response.message || 'Something went wrong. Please try again.'
}

export function getUnknownErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    return getApiErrorMessage(error.response.data as ApiResponse<unknown>)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
