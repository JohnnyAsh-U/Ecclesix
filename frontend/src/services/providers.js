import axios from '../utils/config/axiosConfig'
import useSWR from 'swr'

const API_BASE = '/communications'

/**
 * Fetcher function for SWR - extracts data from axios response
 */
const fetcher = (url) => axios.get(url).then(res => res.data)

/**
 * Hook to fetch all provider configurations
 * @param {Object} filters - Optional filters (channel, provider, is_active)
 * @returns {Object} SWR result with data, error, isLoading, mutate
 */
export const useProviderConfigs = (filters = {}) => {
  let url = `${API_BASE}/provider-configs/`
  const params = new URLSearchParams()
  
  if (filters.channel) params.append('channel', filters.channel)
  if (filters.provider) params.append('provider', filters.provider)
  if (filters.is_active !== undefined) params.append('is_active', filters.is_active)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    configs: data?.results || data || [],
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Hook to fetch a single provider configuration
 * @param {number} configId - Provider Config ID
 * @returns {Object} SWR result with config data
 */
export const useProviderConfig = (configId) => {
  const url = configId ? `${API_BASE}/provider-configs/${configId}/` : null
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    config: data,
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Create or update provider configuration
 * @param {Object} configData - Provider config payload
 * @returns {Promise} Axios promise
 */
export const createProviderConfig = async (configData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/provider-configs/`,
      configData
    )
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Test provider connection
 * @param {number} configId - Provider Config ID
 * @returns {Promise} Axios promise
 */
export const testProviderConnection = async (configId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/provider-configs/${configId}/test_connection/`,
      {}
    )
    return { success: response.data.success, error: response.data.error }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Update provider configuration (partial)
 * @param {number} configId - Provider Config ID
 * @param {Object} updateData - Partial update data
 * @returns {Promise} Axios promise
 */
export const updateProviderConfig = async (configId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/provider-configs/${configId}/`,
      updateData
    )
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Delete provider configuration
 * @param {number} configId - Provider Config ID
 * @returns {Promise} Axios promise
 */
export const deleteProviderConfig = async (configId) => {
  try {
    await axios.delete(`${API_BASE}/provider-configs/${configId}/`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Get available providers and channels
 * @returns {Promise} Provider and channel info
 */
export const getAvailableProviders = async () => {
  try {
    const response = await axios.get(`${API_BASE}/provider-configs/available/`)
    return { success: true, data: response.data }
  } catch (error) {
    // Fallback to hardcoded list if endpoint doesn't exist
    return {
      success: true,
      data: {
        channels: [
          { id: 'email', name: 'Email' },
          { id: 'whatsapp', name: 'WhatsApp' }
        ],
        providers: [
          { id: 'resend', name: 'Resend', channels: ['email'] },
          { id: 'smtp', name: 'SMTP', channels: ['email'] },
          { id: 'dialog360', name: 'Dialog360', channels: ['whatsapp'] }
        ]
      }
    }
  }
}
