/**
 * Foursquare API 診斷腳本 (新版 API)
 *
 * 使用方式：node scripts/test-foursquare.mjs YOUR_API_KEY
 *
 * 新版 API 變更:
 * - Base URL: places-api.foursquare.com (非 api.foursquare.com)
 * - 認證: Bearer token
 * - 需要 X-Places-Api-Version 標頭
 */

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('請提供 API Key：node scripts/test-foursquare.mjs YOUR_API_KEY');
  process.exit(1);
}

console.log('=== Foursquare API 診斷工具 (新版) ===\n');
console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
console.log(`API Key 長度: ${apiKey.length}`);
console.log(`以 fsq3 開頭: ${apiKey.startsWith('fsq3') ? '✓ 是' : '✗ 否'}\n`);

// 新版 API 端點
const testEndpoint = 'https://places-api.foursquare.com/places/search?ll=25.033,121.565&limit=1&fields=fsq_place_id,name,latitude,longitude,location,categories';
const apiVersion = '2025-06-17';

console.log(`測試端點: ${testEndpoint}`);
console.log(`API 版本: ${apiVersion}\n`);

try {
  const response = await fetch(testEndpoint, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'X-Places-Api-Version': apiVersion,
    },
  });

  console.log(`HTTP 狀態碼: ${response.status} ${response.statusText}`);
  console.log(`回應標頭:`);
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase().includes('x-') || key.toLowerCase().includes('ratelimit')) {
      console.log(`  ${key}: ${value}`);
    }
  }

  const body = await response.text();

  if (response.ok) {
    console.log('\n✓ API 連線成功！\n');
    const data = JSON.parse(body);
    console.log(`找到 ${data.results?.length || 0} 個地點`);
    if (data.results?.[0]) {
      const place = data.results[0];
      console.log(`範例:`);
      console.log(`  名稱: ${place.name}`);
      console.log(`  ID: ${place.fsq_place_id}`);
      console.log(`  座標: ${place.latitude}, ${place.longitude}`);
      if (place.categories?.[0]) {
        console.log(`  類別: ${place.categories[0].name}`);
      }
    }
  } else {
    console.log('\n✗ API 連線失敗\n');
    console.log('錯誤回應:', body);

    if (response.status === 401) {
      console.log('\n診斷：認證失敗');
      console.log('建議：');
      console.log('  1. 新版 API 可能需要不同的 Key 類型');
      console.log('  2. 請至 Foursquare Developer Console 檢查 Service Key');
      console.log('  3. 確認專案已升級到新版 Places API');
    } else if (response.status === 410) {
      console.log('\n診斷：API 端點已停用 (410 Gone)');
      console.log('這不應該發生在新版端點，請聯繫 Foursquare 支援');
    } else if (response.status === 429) {
      console.log('\n診斷：已達到 API 速率限制');
    } else if (response.status === 400) {
      console.log('\n診斷：請求格式錯誤');
      console.log('建議：檢查 API 版本日期是否正確');
    }
  }
} catch (error) {
  console.error('網路錯誤:', error.message);
}

// 同時測試舊版端點以供比較
console.log('\n\n--- 舊版端點測試 (預期會失敗) ---\n');

const oldEndpoint = 'https://api.foursquare.com/v3/places/search?ll=25.033,121.565&limit=1';

try {
  const oldResponse = await fetch(oldEndpoint, {
    headers: {
      'Authorization': apiKey,
      'Accept': 'application/json',
    },
  });
  console.log(`舊版端點狀態: ${oldResponse.status} ${oldResponse.statusText}`);
  if (!oldResponse.ok) {
    console.log('預期結果：舊版端點已停用');
  }
} catch (error) {
  console.error('舊版端點錯誤:', error.message);
}
