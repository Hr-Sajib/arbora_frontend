import OrderDeatils from "@/redux/api/order/OrderDeatils";
import React from "react";

const ProductDeatilesPage = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;

  return (
    <div>
      <OrderDeatils id={productId} />
    </div>
  );
};

export default ProductDeatilesPage;
