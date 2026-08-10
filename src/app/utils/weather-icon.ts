/**
 * Maps an Open-Meteo WMO weather code to a Font Awesome icon class.
 * https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
 */
export function getWeatherIcon(code: number): string {
  if (code === 0) {
    return 'fas fa-sun';
  }
  if (code === 1 || code === 2) {
    return 'fas fa-cloud-sun';
  }
  if (code === 3) {
    return 'fas fa-cloud';
  }
  if (code === 45 || code === 48) {
    return 'fas fa-smog';
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67].includes(code)) {
    return 'fas fa-cloud-rain';
  }
  if ([80, 81, 82].includes(code)) {
    return 'fas fa-cloud-showers-heavy';
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'fas fa-snowflake';
  }
  if ([95, 96, 99].includes(code)) {
    return 'fas fa-bolt';
  }
  return 'fas fa-wind';
}
