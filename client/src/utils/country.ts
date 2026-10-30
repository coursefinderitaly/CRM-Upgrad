/** Country name → flag emoji. Handles the country labels used across the CRM. */
export const countryFlag = (country?: string): string => {
  switch ((country || '').trim().toLowerCase()) {
    case 'italy':
      return '🇮🇹';
    case 'germany':
      return '🇩🇪';
    case 'uk':
    case 'united kingdom':
      return '🇬🇧';
    case 'canada':
      return '🇨🇦';
    case 'ireland':
      return '🇮🇪';
    case 'france':
      return '🇫🇷';
    case 'australia':
      return '🇦🇺';
    case 'usa':
    case 'united states':
      return '🇺🇸';
    case 'netherlands':
      return '🇳🇱';
    case 'sweden':
      return '🇸🇪';
    case 'finland':
      return '🇫🇮';
    case 'spain':
      return '🇪🇸';
    case 'switzerland':
      return '🇨🇭';
    case 'singapore':
      return '🇸🇬';
    case 'dubai':
    case 'uae':
      return '🇦🇪';
    default:
      return '🌍';
  }
};
