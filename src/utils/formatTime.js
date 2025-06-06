import moment from "moment";

export const formatTime = (date) => {
  return moment(date).format("MMMM Do YYYY");
};
