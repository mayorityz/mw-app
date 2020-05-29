exports.sortOutPayment = (level, amount) => {
  let result;
  const calcAmt = (percentage, amount) => {
    const expected = percentage * amount + amount;
    return expected;
  };

  if (level === 0) result = calcAmt(0.5, amount);
  if (level === 1) result = calcAmt(0.7, amount);
  if (level === 2) result = calcAmt(0.9, amount);
  if (level === 3) result = calcAmt(1, amount);

  return result;
};

exports.nextPayment = (level, amount) => {
  let result;

  const calcAmt = (percentage, amount) => {
    const x = percentage * amount;
    const expected = amount - x;
    return expected;
  };

  if (level === 1) result = calcAmt(0.5, amount);
  if (level === 2) result = calcAmt(0.7, amount);
  if (level === 3) result = calcAmt(0.9, amount);

  return result;
};
