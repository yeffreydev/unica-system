export  const getRowColor= (hasPaid:boolean, installmentAmount:number) => {
                  //tree states, any payment(green), installment amount 0 and not paid gray, pending orange (installment amount > 0 and no payment)
                  if (hasPaid) return "bg-green-50 dark:bg-green-950/10";
                  if (installmentAmount === 0) return "bg-gray-50 dark:bg-gray-950/10";
                  return "bg-orange-50 dark:bg-orange-950/10";
                }


                export const getPaymentStatusColor = (paymentAmount:number) => {
    if (paymentAmount === 0) return "bg-gray-500 hover:bg-gray-600";
    if (paymentAmount > 0) return "bg-green-600 hover:bg-green-700";
    return "bg-orange-500 hover:bg-orange-600";
  };
