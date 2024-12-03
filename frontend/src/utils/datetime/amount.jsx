export const formatAmount = (amount) => (parseFloat(amount).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 }) + " F") 
