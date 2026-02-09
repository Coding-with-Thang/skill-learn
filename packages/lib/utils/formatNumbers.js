export default function formatNumber(x) {
  //Formats numbers with commas
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
