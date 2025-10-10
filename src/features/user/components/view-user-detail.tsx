// src/features/users/components/view-user-detail.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserDetail } from "@/features/user/hooks/use-users"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Calendar, Mail, Phone, User, Shield, LogIn, UserCheck, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ROUTES } from "@/core/config/routes"
import { JSX } from "react/jsx-runtime"
import { Separator } from "@/shared/ui/separator"

interface ViewUserDetailProps {
    userId: string
}

export function ViewUserDetail({ userId }: ViewUserDetailProps) {
    const { item: user, loading, error } = useUserDetail(userId)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (!loading && error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive",
            })
            router.push(ROUTES.USERS)
        }
    }, [loading, error, toast, router])

    if (loading) return <div className="text-center py-10">Loading...</div>
    if (error || !user) return null

    const formatDate = (date?: Date | string) =>
        date ? new Intl.DateTimeFormat("en-US", { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date)) : "N/A"

    const formatBoolean = (value: boolean) => 
        value ? <Badge variant="success">Yes</Badge> : <Badge variant="outline">No</Badge>

    const getStatusBadge = (status: number) => {
        const statusConfig = {
            1: { text: "Active", variant: "success" as const },
            0: { text: "Inactive", variant: "outline" as const },
            2: { text: "Suspended", variant: "destructive" as const }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { text: "Unknown", variant: "outline" as const }
        return <Badge variant={config.variant}>{config.text}</Badge>
    }

    const InfoRow = ({
        icon,
        label,
        value,
        isMultiple = false,
    }: {
        icon: JSX.Element
        label: string
        value: React.ReactNode
        isMultiple?: boolean
    }) => (
        <div className="flex items-start space-x-2 mb-3 flex-wrap">
            {icon}
            <span className="font-medium min-w-[120px]">{label}:</span>
            {isMultiple ? (
                <div className="flex flex-wrap gap-1">{value}</div>
            ) : (
                <span className="flex-1">{value}</span>
            )}
        </div>
    )

    // Basic User Information
    const BasicInfo = () => (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow
                    icon={<User className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Username"
                    value={user.userName}
                />
                <InfoRow
                    icon={<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Email"
                    value={user.email}
                />
                <InfoRow
                    icon={<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Phone"
                    value={user.phoneNumber || "N/A"}
                />
                <InfoRow
                    icon={<UserCheck className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Email Confirmed"
                    value={formatBoolean(user.emailConfirmed)}
                />
                <InfoRow
                    icon={<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Joined Date"
                    value={formatDate(user.joiningAt)}
                />
                <InfoRow
                    icon={<LogIn className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Last Login"
                    value={formatDate(user.lastLoginAt)}
                />
                <InfoRow
                    icon={<Shield className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Two-Factor Auth"
                    value={formatBoolean(user.twoFactorEnabled)}
                />
                <InfoRow
                    icon={<Shield className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    label="Account Status"
                    value={getStatusBadge(user.status || 1)}
                />
            </div>
        </div>
    )

    // Highlight Stats
    const HighlightStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-xl shadow-sm border">
                <User className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-sm text-muted-foreground">User Since</span>
                <span className="text-lg font-bold text-blue-700 text-center">
                    {new Date(user.joiningAt).getFullYear()}
                </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-xl shadow-sm border">
                <Shield className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-sm text-muted-foreground">Roles</span>
                <span className="text-lg font-bold text-green-700">
                    {user.roles?.length || 0}
                </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-xl shadow-sm border">
                <LogIn className="h-6 w-6 text-amber-600 mb-1" />
                <span className="text-sm text-muted-foreground">Last Active</span>
                <span className="text-lg font-bold text-amber-700 text-center">
                    {user.lastLoginAt ? "Recent" : "Never"}
                </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-xl shadow-sm border">
                <Mail className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-sm text-muted-foreground">Email Status</span>
                <span className="text-lg font-bold text-purple-700 text-center">
                    {user.emailConfirmed ? "Verified" : "Pending"}
                </span>
            </div>
        </div>
    )

    // User Profile Section
    const ProfileInfo = () => {
        const profile = user.customerProfile || user.staffProfile
        
        if (!profile) return null

        // return (
        //     <Card>
        //         <CardHeader>
        //             <CardTitle>
        //                 {user.customerProfile ? "Customer Profile" : "Staff Profile"}
        //             </CardTitle>
        //         </CardHeader>
        //         <CardContent className="space-y-4">
        //             <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        //                 {profile.dateOfBirth && (
        //                     <InfoRow
        //                         icon={<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />}
        //                         label="Date of Birth"
        //                         value={formatDate(profile.dateOfBirth)}
        //                     />
        //                 )}
        //                 {profile.gender && (
        //                     <InfoRow
        //                         icon={<User className="h-4 w-4 text-muted-foreground mt-0.5" />}
        //                         label="Gender"
        //                         value={<Badge variant="outline">{profile.gender}</Badge>}
        //                     />
        //                 )}
        //                 {user.staffProfile?.hireDate && (
        //                     <InfoRow
        //                         icon={<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />}
        //                         label="Hire Date"
        //                         value={formatDate(user.staffProfile.hireDate)}
        //                     />
        //                 )}
        //                 {user.staffProfile?.position && (
        //                     <InfoRow
        //                         icon={<Shield className="h-4 w-4 text-muted-foreground mt-0.5" />}
        //                         label="Position"
        //                         value={<Badge variant="secondary">{user.staffProfile.position}</Badge>}
        //                     />
        //                 )}
        //             </div>
                    
        //             {profile.bio && (
        //                 <>
        //                     <Separator />
        //                     <div>
        //                         <span className="font-medium block mb-2">Bio:</span>
        //                         <p className="text-muted-foreground">{profile.bio}</p>
        //                     </div>
        //                 </>
        //             )}
        //         </CardContent>
        //     </Card>
        // )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4">
            {/* User Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                            <img
                                src={user.avatarPath || "/placeholder-avatar.svg"}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-semibold">
                                {user.firstName} {user.lastName}
                            </CardTitle>
                            <p className="text-muted-foreground">User ID: {user.id}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <HighlightStats />
                    <BasicInfo />
                </CardContent>
            </Card>

            {/* Profile Information */}
            <ProfileInfo />

            {/* Roles Information */}
            <Card>
                <CardHeader>
                    <CardTitle>User Roles ({user.roles?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.roles?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {user.roles.map((role, index) => (
                                <Badge 
                                    key={role.id} 
                                    variant="secondary" 
                                    className="px-3 py-1 text-sm"
                                >
                                    <Shield className="w-3 h-3 mr-1" />
                                    {role.name}
                                    {role.description && (
                                        <span className="ml-1 text-xs opacity-75">
                                            ({role.description})
                                        </span>
                                    )}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No roles assigned</p>
                    )}
                </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Addresses ({user.addresses?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.addresses?.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Postal Code</TableHead>
                                    <TableHead>Default</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.addresses.map((address, index) => (
                                    <TableRow key={address.id}>
                                        <TableCell>
                                            <Badge variant="outline">{address.addressType}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {address.address}
                                        </TableCell>
                                        <TableCell>{address.city}</TableCell>
                                        <TableCell>{address.country}</TableCell>
                                        <TableCell>{address.postalCode}</TableCell>
                                        <TableCell>
                                            {address.isDefault ? (
                                                <Badge variant="success">Yes</Badge>
                                            ) : (
                                                <Badge variant="outline">No</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground">No addresses found</p>
                    )}
                </CardContent>
            </Card>

            {/* Security Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Security Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <InfoRow
                                icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                                label="Lockout Enabled"
                                value={formatBoolean(user.lockoutEnabled)}
                            />
                            <InfoRow
                                icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                                label="Access Failed Count"
                                value={
                                    <Badge variant={user.accessFailedCount > 0 ? "destructive" : "outline"}>
                                        {user.accessFailedCount}
                                    </Badge>
                                }
                            />
                            {user.lockoutEnd && (
                                <InfoRow
                                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                                    label="Lockout End"
                                    value={formatDate(user.lockoutEnd)}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <InfoRow
                                icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                                label="Phone Confirmed"
                                value={formatBoolean(user.phoneNumberConfirmed)}
                            />
                            <InfoRow
                                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                                label="Email Confirmed"
                                value={formatBoolean(user.emailConfirmed)}
                            />
                            <InfoRow
                                icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                                label="Two-Factor Auth"
                                value={formatBoolean(user.twoFactorEnabled)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}