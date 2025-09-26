import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { OrderDetail } from "@/features/orders/components/order-detail"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  return (
    <div>
      <Breadcrumb />
      <OrderDetail orderId={id} />
    </div>
  )
}
