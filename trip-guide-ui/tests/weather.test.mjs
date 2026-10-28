import test from 'node:test';
import assert from 'node:assert/strict';
import {madridToday,forecastWindow,fetchDayForecast,WEATHER_CITIES} from '../site/weather.mjs';
test('uses Madrid calendar and only 7 day forecasts',()=>{
  const now=new Date('2026-12-24T23:30:00Z');
  assert.equal(madridToday(now),'2026-12-25');
  assert.equal(forecastWindow('2026-12-25',now),true);
  assert.equal(forecastWindow('2026-12-31',now),true);
  assert.equal(forecastWindow('2027-01-01',now),false);
  assert.equal(forecastWindow('2026-12-24',now),false);
});
test('maps dated daily output and keeps missing rain unknown',async()=>{
  const data={daily:{time:['2026-12-29'],temperature_2m_max:[14],temperature_2m_min:[5],precipitation_probability_max:[null]}};
  let url='';
  const result=await fetchDayForecast(WEATHER_CITIES.barcelona,'2026-12-29',async u=>{url=u;return {ok:true,json:async()=>data}});
  assert.deepEqual(result,{high:14,low:5,rain:null});
  assert.match(url,/timezone=Europe%2FMadrid/);
});
test('rejects incorrect date and transport failures',async()=>{
  await assert.rejects(fetchDayForecast(WEATHER_CITIES.seville,'2027-01-01',async()=>({ok:true,json:async()=>({daily:{time:['2026-12-31'],temperature_2m_max:[15],temperature_2m_min:[5]}})})));
  await assert.rejects(fetchDayForecast(WEATHER_CITIES.seville,'2027-01-01',async()=>({ok:false,status:503})));
});
