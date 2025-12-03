import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/day/1',
  },
  {
    path: '/day/:dayNumber',
    name: 'DayView',
    component: () => import('@/views/DayView.vue'),
    props: (route) => ({
      dayNumber: Number(route.params.dayNumber),
    }),
  },
  {
    path: '/nearby/:lat/:lng',
    name: 'NearbyView',
    component: () => import('@/views/NearbyView.vue'),
    props: (route) => ({
      lat: Number(route.params.lat),
      lng: Number(route.params.lng),
      locationName: route.query.name as string | undefined,
    }),
  },
  {
    path: '/nearby/:lat/:lng/:placeId',
    name: 'NearbyViewWithDetail',
    component: () => import('@/views/NearbyView.vue'),
    props: (route) => ({
      lat: Number(route.params.lat),
      lng: Number(route.params.lng),
      placeId: route.params.placeId as string,
      locationName: route.query.name as string | undefined,
    }),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
