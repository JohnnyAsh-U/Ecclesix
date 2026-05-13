import axios from '../utils/config/axiosConfig'
import useSWR from 'swr'

const API_BASE = '/members'

/**
 * Fetcher function for SWR - extracts data from axios response
 */
const fetcher = (url) => axios.get(url).then(res => res.data)

/**
 * Hook to fetch all members for campaign audience selection
 * @param {Object} filters - Optional filters (search, status, department)
 * @returns {Object} SWR result with data, error, isLoading, mutate
 */
export const useMembers = (filters = {}) => {
  let url = `${API_BASE}/`
  const params = new URLSearchParams()
  
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.department) params.append('department', filters.department)
  
  // Pagination
  if (filters.page) params.append('page', filters.page)
  if (filters.limit) params.append('limit', filters.limit)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    members: data?.results || data || [],
    count: data?.count || 0,
    pagination: {
      next: data?.next,
      previous: data?.previous,
      page: filters.page || 1
    },
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Get a single member
 * @param {number} memberId - Member ID
 * @returns {Promise} Member data
 */
export const getMember = async (memberId) => {
  try {
    const response = await axios.get(`${API_BASE}/${memberId}/`)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Search members by name or email
 * @param {string} query - Search query
 * @returns {Promise} Search results
 */
export const searchMembers = async (query) => {
  try {
    const response = await axios.get(`${API_BASE}/`, {
      params: { search: query }
    })
    return { success: true, data: response.data?.results || response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Get member contact info (email, phone) for campaign recipient validation
 * @param {number} memberId - Member ID
 * @returns {Promise} Contact info
 */
export const getMemberContactInfo = async (memberId) => {
  try {
    const response = await axios.get(`${API_BASE}/${memberId}/contact-info/`)
    return { success: true, data: response.data }
  } catch (error) {
    // Fallback to regular member endpoint if contact-info doesn't exist
    try {
      const response = await axios.get(`${API_BASE}/${memberId}/`)
      return {
        success: true,
        data: {
          email: response.data.email,
          phone: response.data.phone,
          full_name: response.data.full_name || `${response.data.first_name} ${response.data.last_name}`
        }
      }
    } catch {
      return {
        success: false,
        error: 'Failed to fetch contact info'
      }
    }
  }
}
