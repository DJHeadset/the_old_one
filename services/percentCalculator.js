

exports.percentCalculator = (kid) => {
    let chores = kid.chores || []
    const availablePoints = chores.length + kid.availableScore
    const actualPoints = (chores.filter(chore => chore.adult === true).length || 0) + kid.actualScore
    let percent = kid.percent
    if (availablePoints > 0) {
      percent = Math.floor((actualPoints / availablePoints) * 100)
    }
    return percent
}