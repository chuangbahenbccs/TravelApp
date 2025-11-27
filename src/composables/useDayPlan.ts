import { ref, computed, watch } from 'vue';
import { dayPlanRepository } from '@/repositories/implementations/DexieDayPlanRepository';
import { getDefaultTripId } from '@/database/seed';
import type { DayPlan } from '@/types/day';
import type { Card } from '@/types/card';

export function useDayPlan(initialDayNumber: number = 1) {
  const dayPlan = ref<DayPlan | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentDayNumber = ref(initialDayNumber);
  const expandedCardId = ref<string | null>(null);

  const cards = computed<Card[]>(() => dayPlan.value?.cards ?? []);
  const theme = computed(() => dayPlan.value?.theme ?? '');
  const date = computed(() => dayPlan.value?.date ?? '');
  const dayOfWeek = computed(() => dayPlan.value?.dayOfWeek ?? '');
  const location = computed(() => dayPlan.value?.location ?? '');
  const routeSummary = computed(() => dayPlan.value?.routeSummary);

  async function loadDayPlan(dayNumber: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const tripId = getDefaultTripId();
      const plan = await dayPlanRepository.getByDayNumber(tripId, dayNumber);
      
      if (plan) {
        dayPlan.value = plan;
        currentDayNumber.value = dayNumber;
      } else {
        error.value = `找不到第 ${dayNumber} 天的行程`;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '載入行程時發生錯誤';
      console.error('Failed to load day plan:', e);
    } finally {
      isLoading.value = false;
    }
  }

  function toggleCard(cardId: string) {
    if (expandedCardId.value === cardId) {
      expandedCardId.value = null;
    } else {
      expandedCardId.value = cardId;
    }
  }

  function isCardExpanded(cardId: string): boolean {
    return expandedCardId.value === cardId;
  }

  function collapseAll() {
    expandedCardId.value = null;
  }

  // 當 dayNumber 改變時自動載入
  watch(
    () => currentDayNumber.value,
    (newDayNumber) => {
      loadDayPlan(newDayNumber);
    },
    { immediate: true }
  );

  return {
    // State
    dayPlan,
    isLoading,
    error,
    currentDayNumber,
    expandedCardId,
    // Computed
    cards,
    theme,
    date,
    dayOfWeek,
    location,
    routeSummary,
    // Actions
    loadDayPlan,
    toggleCard,
    isCardExpanded,
    collapseAll,
  };
}
