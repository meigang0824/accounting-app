import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const loadTime = new Trend('load_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // 热身：10 用户
    { duration: '1m', target: 50 },    // 负载：50 用户
    { duration: '2m', target: 100 },   // 压力：100 用户
    { duration: '1m', target: 200 },   // 峰值：200 用户
    { duration: '30s', target: 0 },    // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 请求 < 500ms
    errors: ['rate<0.1'],              // 错误率 < 10%
    load_time: ['p(95)<1000'],         // 95% 加载时间 < 1s
  },
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  // 获取记录列表
  const recordsRes = http.get(`${BASE_URL}/records?page=1&pageSize=20`);
  
  check(recordsRes, {
    'GET /records status is 200': (r) => r.status === 200,
    'GET /records has data': (r) => JSON.parse(r.body).success === true,
  });
  
  errorRate.add(recordsRes.status !== 200);
  loadTime.add(recordsRes.timings.duration);

  sleep(1);

  // 获取分类
  const categoriesRes = http.get(`${BASE_URL}/categories`);
  
  check(categoriesRes, {
    'GET /categories status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 获取统计
  const statsRes = http.get(`${BASE_URL}/statistics/summary?month=2026-03`);
  
  check(statsRes, {
    'GET /statistics/summary status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
