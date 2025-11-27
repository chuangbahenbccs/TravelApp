import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Trip, DayPlan } from '@/types';

export const useTripStore = defineStore('trip', () => {
  // State
  const currentTrip = ref<Trip | null>(null);
  const dayPlans = ref<Map<number, DayPlan>>(new Map());
  const currentDayNumber = ref<number>(1);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const totalDays = computed(() => currentTrip.value?.days.length ?? 0);

  const currentDayPlan = computed(() => {
    return dayPlans.value.get(currentDayNumber.value) ?? null;
  });

  const tripName = computed(() => currentTrip.value?.tripName ?? '');

  const hasNextDay = computed(() => currentDayNumber.value < totalDays.value);

  const hasPreviousDay = computed(() => currentDayNumber.value > 1);

  // Actions
  function setTrip(trip: Trip) {
    currentTrip.value = trip;
  }

  function setDayPlan(dayNumber: number, dayPlan: DayPlan) {
    dayPlans.value.set(dayNumber, dayPlan);
  }

  function setCurrentDayNumber(dayNumber: number) {
    if (dayNumber >= 1 && dayNumber <= totalDays.value) {
      currentDayNumber.value = dayNumber;
    }
  }

  function goToNextDay() {
    if (hasNextDay.value) {
      currentDayNumber.value++;
    }
  }

  function goToPreviousDay() {
    if (hasPreviousDay.value) {
      currentDayNumber.value--;
    }
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    currentTrip,
    dayPlans,
    currentDayNumber,
    isLoading,
    error,
    // Getters
    totalDays,
    currentDayPlan,
    tripName,
    hasNextDay,
    hasPreviousDay,
    // Actions
    setTrip,
    setDayPlan,
    setCurrentDayNumber,
    goToNextDay,
    goToPreviousDay,
    setLoading,
    setError,
    clearError,
  };
});
