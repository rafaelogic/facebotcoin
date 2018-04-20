const getNumbersOnly = (x) => {
  return x.replace( /^\D+/g, '')
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

module.exports = {
  getNumbersOnly,
  numberWithCommas
}
