// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
export function fmtNumberCommas(x: number) {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// With custom settings, forcing a "US" locale to guarantee commas in output
let number = 1234.56789 // floating point example
number.toLocaleString('en-US', {
  minimumFractionDigits: 2, // force a minimum of 2 trailing digits
  maximumFractionDigits: 2,
}) // "1,234.57"
