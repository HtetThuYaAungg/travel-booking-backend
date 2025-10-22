export const formatDateForFilename = (): string => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${day}-${month}-${year}(${formattedHours}-${minutes.toString().padStart(2, '0')}-${seconds.toString().padStart(2, '0')}-${ampm})`;
};

export function capitalize(word?: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}