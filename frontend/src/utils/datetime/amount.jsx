export const formatAmount = (amount) => (parseFloat(amount).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 1 }) + " F") 
