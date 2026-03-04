exports.percentCalculator = (kid) => {
  let chores = kid.chores || [];
  const availablePoints = kid.availableScore;
  const actualPoints = kid.actualScore;
  let percent = kid.percent;
  if (availablePoints > 0) {
    percent = Math.floor((actualPoints / availablePoints) * 100);
  }
  return percent;
};
