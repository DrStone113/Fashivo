//C:\DVWEB\mergre\ct313hm02-project-DrStone113\frontend-spa\src\composables\useCart.js
import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import cartService from '@/services/cart.service';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function useCart() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();
  const authStore = useAuthStore();

  // Fetch user's cart information
  function fetchCartInformation() {
    const { data: cartData, error, isLoading, isError } = useQuery({
      queryKey: ['userCart', authStore.user?.id], // Key phụ thuộc vào user ID
      queryFn: async () => {
        // Luôn cố gắng fetch từ store trước
        await cartStore.fetchUserCart();
        // Trả về dữ liệu từ store để useQuery có thể cache
        return { cart: { id: cartStore.cartId, items: cartStore.items } };
      },
      // enabled: computed(() => authStore.isAuthenticated || true), // Luôn bật để lấy giỏ hàng khách
      staleTime: 1000 * 60 * 5, // 5 phút
      refetchOnWindowFocus: false,
    });
    // Trả về dữ liệu từ cartStore để đảm bảo tính nhất quán
    return {
      cart: computed(() => ({ id: cartStore.cartId, items: cartStore.items })),
      error,
      isLoading,
      isError
    };
  }

  // Add item to cart mutation
  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartStore.addItem({ id: productId }, quantity), // Gọi action từ store
    onSuccess: async () => {
      await queryClient.invalidateQueries(['userCart']); // Invalidate để refetch giỏ hàng
      // cartStore.fetchUserCart() đã được gọi trong action addItem của store
    },
    onError: (error) => {
      console.error('Error adding item to cart:', error);
    }
  });

  // Update item quantity in cart mutation
  const updateItemQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartStore.updateItemQuantity(productId, quantity), // Gọi action từ store
    onSuccess: async () => {
      await queryClient.invalidateQueries(['userCart']);
      // cartStore.fetchUserCart() đã được gọi trong action updateItemQuantity của store
    },
    onError: (error) => {
      console.error('Error updating item quantity:', error);
    }
  });

  // Remove item from cart mutation
  const removeItemMutation = useMutation({
    mutationFn: (productId) => cartStore.removeItem(productId), // Gọi action từ store
    onSuccess: async () => {
      await queryClient.invalidateQueries(['userCart']);
      // cartStore.fetchUserCart() đã được gọi trong action removeItem của store
    },
    onError: (error) => {
      console.error('Error removing item from cart:', error);
    }
  });

  return {
    fetchCartInformation,
    addItemToCart: addItemMutation.mutate,
    updateCartItemQuantity: updateItemQuantityMutation.mutate,
    removeItemFromCart: removeItemMutation.mutate,
    cartItems: computed(() => cartStore.items),
    totalItems: computed(() => cartStore.totalItems),
    totalPrice: computed(() => cartStore.totalPrice),
    clearCart: cartStore.clearCart,
  };
}
