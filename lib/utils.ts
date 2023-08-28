import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// chatgpt
export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

// chatgpt
export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${time} - ${formattedDate}`;
}

// chatgpt
export function formatTweetCount(count: number): string {
  if (count === 0) {
    return "No Tweets";
  } else {
    const tweetCount = count.toString().padStart(2, "0");
    const tweetWord = count === 1 ? "Tweet" : "Tweets";
    return `${tweetCount} ${tweetWord}`;
  }
}