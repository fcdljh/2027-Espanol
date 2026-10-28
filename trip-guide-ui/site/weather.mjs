// Travel-day weather: station climate is historical context, never a forecast.
export const WEATHER_CITIES = {
  barcelona: {name:'巴塞罗那', latitude:41.3874, longitude:2.1686, forecast:'https://www.aemet.es/es/eltiempo/prediccion/municipios/barcelona-id08019', climate:'https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=0076', december:'14.3 / 5.7', january:'13.6 / 4.7'},
  seville: {name:'塞维利亚', latitude:37.3891, longitude:-5.9845, forecast:'https://www.aemet.es/es/eltiempo/prediccion/municipios/sevilla-id41091', climate:'https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5783', december:'16.6 / 7.3', january:'16.0 / 5.7'},
  granada: {name:'格拉纳达', latitude:37.1773, longitude:-3.5986, forecast:'https://www.aemet.es/es/eltiempo/prediccion/municipios/granada-id18087', climate:'https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5530E', december:'13.4 / 1.7', january:'13.0 / 0.0'}
};
export function madridToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const values = Object.fromEntries(parts.map(p => [p.type,p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
export function forecastWindow(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const offset = (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${madridToday(now)}T00:00:00Z`)) / 86400000;
  return Number.isInteger(offset) && offset >= 0 && offset < 7;
}
export async function fetchDayForecast(city, date, fetcher = fetch) {
  const params = new URLSearchParams({latitude:String(city.latitude),longitude:String(city.longitude),daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max',timezone:'Europe/Madrid',start_date:date,end_date:date});
  const response = await fetcher(`https://api.open-meteo.com/v1/forecast?${params}`,{cache:'no-store'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const d = data.daily;
  if (!d || d.time?.[0] !== date || !Number.isFinite(d.temperature_2m_max?.[0]) || !Number.isFinite(d.temperature_2m_min?.[0])) throw new Error('Incomplete forecast');
  const rain = d.precipitation_probability_max?.[0];
  return {high:d.temperature_2m_max[0],low:d.temperature_2m_min[0],rain:Number.isFinite(rain) && rain>=0 && rain<=100 ? rain : null};
}
