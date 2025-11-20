'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '@/store'
import { supabase } from '@/lib/supabase'
import { Order, SubOrder } from '@/types'

export default function OrderStatusPage() {
  const router = useRouter()
  const {
    currentUser,
    currentSession,
    tableNumber,
    setCurrentSession,
    setLoading,
    setError,
    isLoading,
    error,
    _hasHydrated
  } = useStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [subOrders, setSubOrders] = useState<SubOrder[]>([])

  const loadOrderData = async () => {
    if (!currentSession) return

    setLoading(true)
    setError(null)

    try {
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', currentSession.id)
        .is('deleted_at', null)
        .order('ordered_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(ordersData || [])

      // Load updated session with sub-orders
      const { data: sessionData, error: sessionError } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('id', currentSession.id)
        .single()

      if (sessionError) throw sessionError
      setSubOrders(sessionData.sub_orders || [])

      // Update Zustand store with fresh session data for real-time sync
      setCurrentSession(sessionData)

    } catch (error) {
      console.error('Error loading order data:', error)
      setError('Failed to load order status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Wait for hydration before redirecting
  useEffect(() => {
    if (_hasHydrated && (!currentUser || !currentSession)) {
      router.push('/scan')
    }
  }, [_hasHydrated, currentUser, currentSession, router])

  useEffect(() => {
    if (!_hasHydrated || !currentUser || !currentSession) return

    const sessionId = currentSession.id

    loadOrderData()

    // Set up real-time subscription for orders
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('🔄 Real-time order update received:', payload)
          loadOrderData()
        }
      )
      .subscribe()

    // Set up real-time subscription for table sessions (sub-orders)
    const sessionSubscription = supabase
      .channel('session-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('🔄 Real-time session update received:', payload)
          loadOrderData()
        }
      )
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
      sessionSubscription.unsubscribe()
    }
  }, [_hasHydrated, currentUser])

  const getOrdersBySubOrder = (subOrderId: string) => {
    return orders.filter(order => order.sub_order_id === subOrderId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'preparing': return '👨‍🍳'
      case 'ready': return '✅'
      case 'delivered': return '🍽️'
      default: return '❓'
    }
  }

  // Don't render until hydrated
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{animationDuration: '1.5s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 animate-pulse">Loading...</h3>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (after hydration)
  if (!currentUser || !currentSession) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{animationDuration: '1.5s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 animate-pulse">Loading Orders</h3>
          <p className="text-gray-600">Fetching your order history...</p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order Status</h1>
              <p className="text-sm text-gray-600">Table {tableNumber} • {currentUser.user_name}</p>
            </div>
            <button
              onClick={() => router.push('/menu')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Order More
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {subOrders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start by adding some items to your cart!</p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subOrders.map((subOrder) => {
              const subOrderOrders = getOrdersBySubOrder(subOrder.id)
              
              return (
                <div key={subOrder.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subOrder.sub_order_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered by {subOrder.user_name} • {new Date(subOrder.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                          {getStatusIcon(subOrder.status)} {subOrder.status.toUpperCase()}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${subOrder.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Items:</h4>
                    <div className="space-y-3">
                      {subOrderOrders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{order.menu_item_name}</span>
                            <span className="text-gray-700 ml-2">×{order.quantity}</span>
                            {order.special_instructions && (
                              <p className="text-sm text-gray-700 mt-1">
                                Note: {order.special_instructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">${order.total_price.toFixed(2)}</span>
                            <p className="text-xs text-gray-700">
                              ${order.menu_item_price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Table Summary */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Table Total
              </h3>
              <div className="text-2xl font-bold text-blue-900">
                ${subOrders.reduce((total, subOrder) => total + subOrder.total_amount, 0).toFixed(2)}
              </div>
              <p className="text-sm text-blue-900 mt-1">
                {subOrders.length} order{subOrders.length !== 1 ? 's' : ''} • {orders.length} item{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}