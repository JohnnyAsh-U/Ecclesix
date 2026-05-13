import axios from '../utils/config/axiosConfig'
import useSWR from 'swr'

const API_BASE = '/communications'

/**
 * Fetcher function for SWR - extracts data from axios response
 */
const fetcher = (url) => axios.get(url).then(res => res.data)

/**
 * Hook to fetch all campaigns with optional filtering
 * @param {Object} filters - Optional filters (status, channel, provider)
 * @returns {Object} SWR result with data, error, isLoading, mutate
 */
export const useCampaigns = (filters = {}) => {
  let url = `${API_BASE}/campaigns/`
  const params = new URLSearchParams()
  
  if (filters.status) params.append('status', filters.status)
  if (filters.channel) params.append('channel', filters.channel)
  if (filters.provider) params.append('provider', filters.provider)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    campaigns: data?.results || data || [],
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Hook to fetch a single campaign with all details and recipients
 * @param {number} campaignId - Campaign ID
 * @returns {Object} SWR result with campaign data
 */
export const useCampaign = (campaignId) => {
  const url = campaignId ? `${API_BASE}/campaigns/${campaignId}/` : null
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    campaign: data,
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Hook to fetch campaign statistics
 * @param {number} campaignId - Campaign ID
 * @returns {Object} SWR result with stats data
 */
export const useCampaignStats = (campaignId) => {
  const url = campaignId ? `${API_BASE}/campaigns/${campaignId}/statistics/` : null
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    stats: data,
    isLoading,
    error,
    mutate,
    isError: !!error
  }
}

/**
 * Create a new campaign
 * @param {Object} campaignData - Campaign creation payload
 * @returns {Promise} Axios promise
 */
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(`${API_BASE}/campaigns/`, campaignData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Send a campaign immediately
 * @param {number} campaignId - Campaign ID
 * @returns {Promise} Axios promise
 */
export const sendCampaign = async (campaignId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/campaigns/${campaignId}/send/`,
      {}
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
 * Retry failed recipients for a campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise} Axios promise
 */
export const retryFailedRecipients = async (campaignId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/campaigns/${campaignId}/retry_failed/`,
      {}
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
 * Update campaign (patch)
 * @param {number} campaignId - Campaign ID
 * @param {Object} updateData - Partial update data
 * @returns {Promise} Axios promise
 */
export const updateCampaign = async (campaignId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/campaigns/${campaignId}/`,
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
 * Delete campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise} Axios promise
 */
export const deleteCampaign = async (campaignId) => {
  try {
    await axios.delete(`${API_BASE}/campaigns/${campaignId}/`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}
