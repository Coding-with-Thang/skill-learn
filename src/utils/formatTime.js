import moment from "moment";

export const formatTime = (date) => {
  return moment(date).format("Do MMM YYY, HH:mm");
};
