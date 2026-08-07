import { MenuItem, CartItem } from '../types/pos';

export interface AIRecommendation {
  suggestedItem: MenuItem;
  reason: string;
  confidenceScore: number;
}

/**
 * Intelligent AI Recommendation Engine for CHA CHI BAP POS
 */
export function getAIItemRecommendations(
  cartItems: CartItem[],
  allMenu: MenuItem[]
): AIRecommendation[] {
  if (cartItems.length === 0) {
    // If cart is empty, recommend Best Sellers
    const bestSellers = allMenu.filter((m) => m.isBestSeller);
    return bestSellers.slice(0, 2).map((item) => ({
      suggestedItem: item,
      reason: '🔥 Món Best-Seller được khách hàng yêu thích nhất!',
      confidenceScore: 0.95,
    }));
  }

  const recommendations: AIRecommendation[] = [];
  const cartCategories = cartItems.map((ci) => ci.menuItem.category);
  const cartItemIds = new Set(cartItems.map((ci) => ci.menuItem.id));

  const hasFood = cartCategories.includes('mon-an');
  const hasDrink = cartCategories.includes('nuoc-uong');

  // Rule 1: If customer ordered Food but no Drinks -> Suggest Refreshing Drinks
  if (hasFood && !hasDrink) {
    const drinks = allMenu.filter((m) => m.category === 'nuoc-uong' && !cartItemIds.has(m.id));
    if (drinks.length > 0) {
      recommendations.push({
        suggestedItem: drinks[0],
        reason: '💡 Gợi ý AI: Uống cùng Trà tắc / Cà phê giải nhiệt khi ăn đồ chiên giòn!',
        confidenceScore: 0.92,
      });
    }
  }

  // Rule 2: If customer ordered Drinks but no Food -> Suggest Chả Giò Bắp
  if (hasDrink && !hasFood) {
    const foods = allMenu.filter((m) => m.category === 'mon-an' && !cartItemIds.has(m.id));
    if (foods.length > 0) {
      recommendations.push({
        suggestedItem: foods[0],
        reason: '💡 Gợi ý AI: Dùng kèm Chả Giò Bắp nóng giòn thơm lừng!',
        confidenceScore: 0.9,
      });
    }
  }

  // Rule 3: Suggest Toppings if drink is selected
  const hasDrinkInCart = cartItems.some((ci) => ci.menuItem.category === 'nuoc-uong');
  if (hasDrinkInCart && recommendations.length < 2) {
    const bestDrink = allMenu.find((m) => m.sku === 'CCB-03' || m.category === 'nuoc-uong');
    if (bestDrink && !cartItemIds.has(bestDrink.id)) {
      recommendations.push({
        suggestedItem: bestDrink,
        reason: '⭐ Thử thêm món nước signature CHA CHI BAP!',
        confidenceScore: 0.85,
      });
    }
  }

  return recommendations;
}
