import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { OrderStats } from "@/features/orders/components/order-stats"
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Products",
      value: "567",
      change: "+5%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Orders",
      value: "89",
      change: "+23%",
      changeType: "positive" as const,
      icon: ShoppingCart,
    },
    {
      title: "Revenue",
      value: "$12,345",
      change: "+18%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>

        <OrderStats />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <span>{stat.change} from last month</span>
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New order received: ORD-2024-001</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Order #1234 shipped</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Product &quot;Anime Figure&quot; low stock</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New user registered: John Doe</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <Users className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-sm font-medium">Add User</p>
                </button>
                <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <Package className="h-6 w-6 text-green-500 mb-2" />
                  <p className="text-sm font-medium">Add Product</p>
                </button>
                <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <ShoppingCart className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm font-medium">View Orders</p>
                </button>
                <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
                  <p className="text-sm font-medium">View Reports</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
