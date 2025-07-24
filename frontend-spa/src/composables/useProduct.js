// C:\DVWEB\mergre\ct313hm02-project-DrStone113\frontend-spa\src\composables\useProduct.js

// CHỈ GIỮ LẠI DÒNG IMPORT ĐÚNG NÀY:
import { computed, ref, watch, unref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import productService from '@/services/product.service';

export default function useProduct() {
  function fetchProducts(page, filters = {}) {
    const queryResult = useQuery({
      queryKey: computed(() => ['products', page.value, { ...filters.value }]),
      queryFn: async () => {
        try {
          return await productService.fetchProducts(page.value, 9, filters.value);
        } catch (err) {
          console.error('Fetch products failed:', err);
          throw err;
        }
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    });

    const products = computed(() => queryResult.data.value?.products ?? []);
    const totalPages = computed(() => queryResult.data.value?.metadata?.totalPages ?? 1);

    return { products, totalPages, ...queryResult };
  }

  function fetchProduct(idRef) {
    const productId = computed(() => {
      const val = unref(idRef);
      const numVal = Number(val);
      return isNaN(numVal) ? null : numVal;
    });

    const queryResult = useQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
        const idValue = productId.value;
        if (idValue === null) {
          throw new Error('Product ID is null or invalid.');
        }
        try {
          return await productService.fetchProduct(idValue);
        } catch (err) {
          console.error('Fetch single product failed:', err);
          throw err;
        }
      },
      enabled: computed(() => productId.value !== null),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    });

    const product = computed(() => queryResult.data.value ?? null);

    return { product, ...queryResult };
  }

  return {
    fetchProducts,
    fetchProduct
  };
}
