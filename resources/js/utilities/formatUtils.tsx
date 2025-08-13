// src/utilities/formatUtils.ts

/**
 * Formats a given date string to a human-readable format in Manila's timezone.
 * @param dateString The date string to format (e.g., ISO 8601 string).
 * @returns Formatted date string, or an empty string if input is invalid.
 */
export const formatToManila = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "";
  }

  try {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      year: '2-digit', // Changed to '2-digit'
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Manila',
    };

    return new Intl.DateTimeFormat('en-PH', options).format(date);
  } catch (error) {
    console.error("Error formatting date to Manila timezone:", error);
    return "";
  }
};