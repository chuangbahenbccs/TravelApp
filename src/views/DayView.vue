<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDayPlan } from '@/composables/useDayPlan';
import { seedDatabase } from '@/database/seed';
import { isActivityCard, isRestaurantCard, isTransportCard } from '@/types/card';
import ActivityCard from '@/components/cards/ActivityCard.vue';
import RestaurantCard from '@/components/cards/RestaurantCard.vue';
import TransportCard from '@/components/cards/TransportCard.vue';
import DaySelector from '@/components/navigation/DaySelector.vue';
import RouteSummary from '@/components/layout/RouteSummary.vue';

interface Props {
  dayNumber: number;
}

const props = defineProps<Props>();
const router = useRouter();

const {
  isLoading,
  error,
  cards,
  theme,
  date,
  dayOfWeek,
  location,
  routeSummary,
  currentDayNumber,
  loadDayPlan,
  toggleCard,
  isCardExpanded,
} = useDayPlan(props.dayNumber);

function handleDayChange(day: number) {
  router.push(`/day/${day}`);
}

onMounted(async () => {
  await seedDatabase();
  if (props.dayNumber !== currentDayNumber.value) {
    loadDayPlan(props.dayNumber);
  }
});

// 監聽路由參數變化，當日期切換時重新載入資料
watch(
  () => props.dayNumber,
  (newDayNumber: number) => {
    if (newDayNumber !== currentDayNumber.value) {
      loadDayPlan(newDayNumber);
    }
  }
);
</script>

<template>
  <main class="day-view page">
    <header class="day-header">
      <div class="day-meta">
        <span class="day-number">第 {{ currentDayNumber }} 天</span>
        <span class="day-date">{{ date }} {{ dayOfWeek }}</span>
      </div>
      <h1 class="day-theme">{{ theme }}</h1>
      <p class="day-location">📍 {{ location }}</p>
    </header>

    <DaySelector
      :current-day="currentDayNumber"
      :total-days="6"
      @change="handleDayChange"
    />

    <RouteSummary
      v-if="routeSummary"
      :description="routeSummary.description"
      :map-url="routeSummary.mapUrl"
    />

    <div v-if="isLoading" class="loading-state">
      <div class="skeleton card-skeleton"></div>
      <div class="skeleton card-skeleton"></div>
      <div class="skeleton card-skeleton"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary" @click="loadDayPlan(currentDayNumber)">
        重新載入
      </button>
    </div>

    <section v-else class="card-list">
      <template v-for="card in cards" :key="card.cardId">
        <ActivityCard
          v-if="isActivityCard(card)"
          :card="card"
          :expanded="isCardExpanded(card.cardId)"
          @toggle="toggleCard(card.cardId)"
        />
        <RestaurantCard
          v-else-if="isRestaurantCard(card)"
          :card="card"
          :expanded="isCardExpanded(card.cardId)"
          @toggle="toggleCard(card.cardId)"
        />
        <TransportCard
          v-else-if="isTransportCard(card)"
          :card="card"
          :expanded="isCardExpanded(card.cardId)"
          @toggle="toggleCard(card.cardId)"
        />
      </template>
    </section>
  </main>
</template>

<style scoped>
.day-view {
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md) + env(safe-area-inset-top, 0px));
}

.day-header {
  margin-bottom: var(--spacing-lg);
}

.day-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.day-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-activity);
  padding: 2px var(--spacing-sm);
  background: var(--color-activity-bg);
  border-radius: var(--radius-full);
}

.day-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.day-theme {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
  line-height: var(--line-height-tight);
}

.day-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-skeleton {
  height: 120px;
  border-radius: var(--radius-md);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
}

.card-list {
  display: flex;
  flex-direction: column;
}
</style>
