'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '@/store'
import { supabaseApi } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function CartPage() {
  const router = useRouter()
  const {
    currentUser,
    currentSession,
    tableNumber,
    cartItems,
    currentSubOrderName,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setSubOrderName,
    setLoading,
    setError,
    isLoading,
    error,
    _hasHydrated
  } = useStore()

  const [subOrderNameInput, setSubOrderNameInput] = useState(
    currentSubOrderName || `${currentUser?.user_name}'s Order`
  )

  // Wait for hydration before redirecting
  useEffect(() => {
    if (_hasHydrated && (!currentUser || !currentSession)) {
      router.push('/scan')
    }
  }, [_hasHydrated, currentUser, currentSession, router])

  // Don't render until hydrated
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (after hydration)
  if (!currentUser || !currentSession) {
    return null
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      updateCartQuantity(itemId, newQuantity)
    }
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    if (!subOrderNameInput.trim()) {
      setError('Please enter a name for your order')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create sub-order ID
      const subOrderId = uuidv4()
      
      // Update sub-order name in store
      setSubOrderName(subOrderNameInput)

      // Create sub-order object
      const newSubOrder = {
        id: subOrderId,
        user_id: currentUser.id,
        user_name: currentUser.user_name,
        sub_order_name: subOrderNameInput,
        status: 'pending' as const,
        total_amount: getTotalPrice(),
        created_at: new Date().toISOString()
      }

      // Update session with new sub-order
      const updatedSubOrders = [...currentSession.sub_orders, newSubOrder]
      await supabaseApi.updateSessionSubOrders(currentSession.id, updatedSubOrders)

      // Create individual orders
      for (const cartItem of cartItems) {
        await supabaseApi.createOrder({
          session_id: currentSession.id,
          sub_order_id: subOrderId,
          user_id: currentUser.id,
          menu_item_id: cartItem.menu_item.id,
          menu_item_name: cartItem.menu_item.name,
          menu_item_price: cartItem.menu_item.price,
          quantity: cartItem.quantity,
          special_instructions: cartItem.special_instructions,
          total_price: cartItem.total_price
        })
      }

      // Clear cart
      clearCart()

      // Redirect to order status
      router.push('/order-status')
    } catch (error) {
      console.error('Error placing order:', error)
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="card glass-effect max-w-md mx-auto animate-slide-up">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9M17 18h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">Ready to discover amazing flavors? Browse our delicious menu!</p>
                <button
                  onClick={() => router.push('/menu')}
                  className="btn-primary"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Browse Menu</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9M17 18h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-sm text-gray-600">Table {tableNumber} • {currentUser.user_name}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/menu')}
              className="text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sub-order Name */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Name</h2>
          <input
            type="text"
            value={subOrderNameInput}
            onChange={(e) => setSubOrderNameInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a name for this order..."
          />
          <p className="text-sm text-gray-500 mt-2">
            This helps identify your order on the table
          </p>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.menu_item.id}-${index}`} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.menu_item.name}</h3>
                  <p className="text-sm text-gray-600">${item.menu_item.price.toFixed(2)} each</p>
                  {item.special_instructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.menu_item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-300 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.menu_item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="w-20 text-right">
                    <span className="font-bold text-gray-900">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.menu_item.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Items ({getTotalItems()})</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
              <span>Total</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg"
            >
              Clear Cart
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}