"use client"

import { env } from "@/core/config/env"
import { API_ROUTES } from "@/core/config/routes"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

export default function DebugPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>BASE_URL:</strong> {env.BASE_URL}
          </div>
          <div>
            <strong>CMS_PREFIX:</strong> {env.CMS_PREFIX}
          </div>
          <div>
            <strong>Full API URL (Payment Methods):</strong><br />
            {env.BASE_URL + env.CMS_PREFIX + '/payment-methods'}
          </div>
          <div>
            <strong>API_ROUTES.PAYMENT_METHODS:</strong><br />
            {API_ROUTES.PAYMENT_METHODS}
          </div>
          <div>
            <strong>Environment Variables:</strong>
            <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
              {JSON.stringify({
                NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
                NEXT_PUBLIC_CMS_PREFIX: process.env.NEXT_PUBLIC_CMS_PREFIX,
                NODE_ENV: process.env.NODE_ENV
              }, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
