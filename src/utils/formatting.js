export const formatIQD = (value) => {
  const amount = Number(value || 0);
  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("en-US");
};

export const measurementOptions = ["متر", "متر طولي", "قطعة"];
