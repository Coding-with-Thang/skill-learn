import moment from "moment";

export const formatTime = (date) => {
  return moment(date).format("Do MMMM YYYY, HH:mm");
};
