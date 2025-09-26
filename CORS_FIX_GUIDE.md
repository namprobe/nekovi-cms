# 🔧 CORS Fix Guide for NekoVi CMS + Backend

## 🚨 **Vấn đề hiện tại:**

1. **Double Slash URL**: `https://domain.com//api/cms` 
2. **CORS Domain mismatch**: Backend chỉ allow `nekovi-cms.vercel.app` nhưng request từ domain khác

## ✅ **Solutions:**

### **1. Frontend đã fix (trong env.ts):**
- ✅ Added `normalizeUrl()` function để remove trailing slash
- ✅ Added debug logs để track URL construction

### **2. Backend CORS Configuration cần update:**

#### **A. Update appsettings.json:**
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:4200",
      "https://nekovi-cms.vercel.app",
      "https://your-actual-vercel-domain.vercel.app",
      "*"  // Temporary cho testing - remove in production
    ]
  }
}
```

#### **B. Alternative: Update CorsConfiguration.cs để allow wildcard subdomains:**
```csharp
// In line 49, add wildcard subdomain support
policy
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithExposedHeaders("Content-Disposition", "Token-Expired")
    .SetIsOriginAllowedToAllowWildcardSubdomains()
    .SetIsOriginAllowed(origin => true); // Temporary for testing
```

### **3. Vercel Environment Variables:**

Trên Vercel dashboard, set environment variables:
```
NEXT_PUBLIC_BASE_URL=https://35662633ee64.ngrok-free.app
NEXT_PUBLIC_CMS_PREFIX=/api/cms
NEXT_PUBLIC_COMMON_PREFIX=/api/common
```

### **4. Ngrok Configuration:**

Ensure ngrok tunnel is stable:
```bash
ngrok http 5240 --host-header="localhost:5240"
```

### **5. Testing:**

1. **Check URL construction** in browser console (debug logs)
2. **Verify CORS headers** in Network tab
3. **Test API calls** from Vercel deployment

## 🔍 **Debug Steps:**

1. Open browser console on Vercel deployment
2. Look for `🔗 API Request:` logs 
3. Check if finalURL has double slashes
4. Verify CORS response headers in Network tab

## 📝 **Next Steps:**

1. Update backend appsettings.json with correct Vercel domain
2. Restart backend server
3. Test login from Vercel deployment
4. Remove debug logs after confirmation
