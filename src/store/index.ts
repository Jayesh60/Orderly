import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, TableSession, SessionUser, MenuItem, MenuCategory } from '@/types'

interface AppState {
  // User state
  currentUser: SessionUser | null
  isAuthenticated: boolean

  // Session state
  currentSession: TableSession | null
  tableNumber: string | null

  // Menu state
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]

  // Cart state
  cartItems: CartItem[]
  currentSubOrderName: string

  // UI state
  isLoading: boolean
  error: string | null

  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Actions
  setCurrentUser: (user: SessionUser | null) => void
  setCurrentSession: (session: TableSession | null) => void
  setTableNumber: (tableNumber: string | null) => void
  setMenuData: (categories: MenuCategory[], items: MenuItem[]) => void
  addToCart: (item: MenuItem, quantity: number, instructions?: string) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setSubOrderName: (name: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      currentSession: null,
      tableNumber: null,
      menuCategories: [],
      menuItems: [],
      cartItems: [],
      currentSubOrderName: '',
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),

      setCurrentSession: (session) => set({ currentSession: session }),

      setTableNumber: (tableNumber) => set({ tableNumber }),

      setMenuData: (categories, items) => set({
        menuCategories: categories,
        menuItems: items
      }),

      addToCart: (item, quantity, instructions) => {
        const { cartItems } = get()
        const existingItemIndex = cartItems.findIndex(cartItem =>
          cartItem.menu_item.id === item.id &&
          cartItem.special_instructions === instructions
        )

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...cartItems]
          updatedItems[existingItemIndex].quantity += quantity
          updatedItems[existingItemIndex].total_price =
            updatedItems[existingItemIndex].quantity * item.price
          set({ cartItems: updatedItems })
        } else {
          // Add new item
          const newItem: CartItem = {
            menu_item: item,
            quantity,
            special_instructions: instructions,
            total_price: quantity * item.price
          }
          set({ cartItems: [...cartItems, newItem] })
        }
      },

      removeFromCart: (itemId) => {
        const { cartItems } = get()
        set({ cartItems: cartItems.filter(item => item.menu_item.id !== itemId) })
      },

      updateCartQuantity: (itemId, quantity) => {
        const { cartItems } = get()
        const updatedItems = cartItems.map(item =>
          item.menu_item.id === itemId
            ? { ...item, quantity, total_price: quantity * item.menu_item.price }
            : item
        )
        set({ cartItems: updatedItems })
      },

      clearCart: () => set({ cartItems: [] }),

      setSubOrderName: (name) => set({ currentSubOrderName: name }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set({
        currentUser: null,
        isAuthenticated: false,
        currentSession: null,
        tableNumber: null,
        cartItems: [],
        currentSubOrderName: '',
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'cafe-ordering-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        currentSession: state.currentSession,
        tableNumber: state.tableNumber,
        cartItems: state.cartItems,
        currentSubOrderName: state.currentSubOrderName,
        menuCategories: state.menuCategories,
        menuItems: state.menuItems
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

export default useStore