// src/entities/orders/model/order-store.ts
import { create } from "zustand"
import { orderApi } from "../api/order-api"
import type { OrderDto, OrderListItem, OrderFilterParams } from "../types/order"
import { DEFAULT_ORDER_FILTER } from "../lib/constants"
import type { PaginateResult } from "@/shared/types/common"

interface OrderStore {
  // List State
  orders: OrderListItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    hasPrevious: boolean
    hasNext: boolean
  }
  filters: OrderFilterParams
  isLoading: boolean
  error: string | null

  // Detail State
  selectedOrder: OrderDto | null
  isLoadingDetail: boolean
  detailError: string | null

  // Mount tracking
  mountCount: number
  lastFetchTime: number | null
  CACHE_DURATION: number // 30 seconds

  // Actions
  fetchOrders: (params?: OrderFilterParams, force?: boolean) => Promise<void>
  fetchOrderById: (id: string, force?: boolean) => Promise<void>
  setFilters: (filters: Partial<OrderFilterParams>) => void
  resetFilters: () => void
  clearSelectedOrder: () => void
  incrementMount: () => void
  decrementMount: () => void
  reset: () => void
}

const initialState = {
  orders: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
    hasPrevious: false,
    hasNext: false,
  },
  filters: DEFAULT_ORDER_FILTER,
  isLoading: false,
  error: null,
  selectedOrder: null,
  isLoadingDetail: false,
  detailError: null,
  mountCount: 0,
  lastFetchTime: null,
  CACHE_DURATION: 30000, // 30 seconds
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  ...initialState,

  /**
   * Fetch orders with caching and mount tracking
   */
  fetchOrders: async (params?: OrderFilterParams, force = false) => {
    const state = get()
    
    // Prevent fetch if:
    // 1. No components mounted
    // 2. Already loading
    if (state.mountCount === 0 || state.isLoading) {
      console.log("🚫 Skipping fetch: mountCount =", state.mountCount, "isLoading =", state.isLoading)
      return
    }

    const now = Date.now()
    const isCacheValid = state.lastFetchTime && (now - state.lastFetchTime < state.CACHE_DURATION)
    
    // Check if filters actually changed
    const mergedFilters = { ...state.filters, ...params }
    const filtersChanged = JSON.stringify(state.filters) !== JSON.stringify(mergedFilters)
    
    if (!force && isCacheValid && state.orders.length > 0 && !filtersChanged) {
      console.log("📦 Using cached orders data")
      return
    }

    console.log("🔄 Fetching orders with filters:", mergedFilters)
    set({ isLoading: true, error: null })

    try {
      const result = await orderApi.getOrders(mergedFilters)

      if (result.isSuccess) {
        set({
          orders: result.items,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
            pageSize: result.pageSize,
            hasPrevious: result.hasPrevious,
            hasNext: result.hasNext,
          },
          filters: mergedFilters,
          isLoading: false,
          lastFetchTime: now,
        })
        console.log("✅ Orders fetched successfully:", result.items.length)
      } else {
        set({
          error: result.errors?.[0] || "Failed to fetch orders",
          isLoading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      })
    }
  },

  /**
   * Fetch order detail by ID with caching
   */
  fetchOrderById: async (id: string, force = false) => {
    const state = get()
    
    // Prevent duplicate fetch if already loading
    if (state.isLoadingDetail) {
      console.log("🚫 Already loading order detail, skipping duplicate call")
      return
    }
    
    // Check if already loaded and cache valid
    if (!force && state.selectedOrder?.id === id) {
      console.log("📦 Using cached order detail for ID:", id)
      return
    }

    console.log("🔄 Fetching order detail for ID:", id)
    set({ isLoadingDetail: true, detailError: null })

    try {
      const result = await orderApi.getOrderById(id)

      if (result.isSuccess && result.data) {
        console.log("✅ Order detail fetched successfully:", result.data.id)
        set({
          selectedOrder: result.data,
          isLoadingDetail: false,
        })
      } else {
        set({
          detailError: result.errors?.[0] || "Failed to fetch order details",
          isLoadingDetail: false,
        })
      }
    } catch (error) {
      set({
        detailError: error instanceof Error ? error.message : "An error occurred",
        isLoadingDetail: false,
      })
    }
  },

  /**
   * Update filters (doesn't trigger fetch - component will handle it via useEffect)
   */
  setFilters: (newFilters: Partial<OrderFilterParams>) => {
    set((state) => ({
      filters: { 
        ...state.filters, 
        ...newFilters,
        // Only reset to page 1 if filters changed (not page itself)
        page: newFilters.page !== undefined ? newFilters.page : 1
      }
    }))
  },

  /**
   * Reset filters to default
   */
  resetFilters: () => {
    set({ filters: DEFAULT_ORDER_FILTER })
    get().fetchOrders(DEFAULT_ORDER_FILTER, true)
  },

  /**
   * Clear selected order detail
   */
  clearSelectedOrder: () => {
    set({ selectedOrder: null, detailError: null })
  },

  /**
   * Increment mount count (called when component mounts)
   */
  incrementMount: () => {
    set((state) => ({ mountCount: state.mountCount + 1 }))
  },

  /**
   * Decrement mount count (called when component unmounts)
   */
  decrementMount: () => {
    set((state) => ({ mountCount: Math.max(0, state.mountCount - 1) }))
  },

  /**
   * Reset entire store
   */
  reset: () => {
    set(initialState)
  },
}))

/**
 * Custom hook with automatic mount/unmount tracking
 */
export const useOrderList = () => {
  const store = useOrderStore()
  
  // Use in components with useEffect for mount tracking
  return store
}

/**
 * Selector hooks for better performance
 */
export const useOrderFilters = () => useOrderStore((state) => state.filters)
export const useOrderPagination = () => useOrderStore((state) => state.pagination)
export const useSelectedOrder = () => useOrderStore((state) => state.selectedOrder)

