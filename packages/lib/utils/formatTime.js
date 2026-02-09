import { format } from "date-fns";

export const formatTime = (date) => {
  return format(new Date(date), "MMMM do yyyy");
};
