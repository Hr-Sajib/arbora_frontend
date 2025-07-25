import Payment from '@/Features/payment/Payment'
import React from 'react'

const PaymentManagement=async({params}:{params:any}) => {
    const {productId,paymentId}=await params
  return (
   <Payment productId={productId} paymentId={paymentId}/>
  )
}

export default PaymentManagement