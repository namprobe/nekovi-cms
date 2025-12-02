"use client"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { tagService } from "@/entities/tags/services/tag"
import type { Tag } from "@/entities/tags/types/tag"
import { TagFormDialog } from "./tag-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { STATUS_VARIANTS } from "@/core/config/constants"

export function TagList() {
    const { toast } = useToast()
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<Tag | null>(null)
    const [total, setTotal] = useState(0)
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const initialPage = Number(searchParams.get("page")) || 1
    const initialSearch = searchParams.get("search") || ""
    const [page, setPage] = useState(initialPage)
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchTerm, 400)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const updateUrl = (page: number, search: string) => {
        const params = new URLSearchParams()
        if (page > 1) params.set("page", String(page))
        if (search.trim()) params.set("search", search)
        const query = params.toString()
        router.replace(`${pathname}${query ? `?${query}` : ""}`)
    }

    useEffect(() => updateUrl(page, debouncedSearch), [page, debouncedSearch])

    const fetchTags = async () => {
        try {
            setLoading(true)
            const res = await tagService.getTags({
                page,
                pageSize: 10,
                search: debouncedSearch || undefined,
            })
            setTags(res.items || [])
            setTotal(res.totalItems || 0)
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to load tags", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTags() }, [page, debouncedSearch])

    const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
        try {
            if (isEdit && id) {
                await tagService.updateTag(id, formData)
                toast({ title: "Success", description: "Tag updated successfully" })
            } else {
                await tagService.createTag(formData)
                toast({ title: "Success", description: "Tag created successfully" })
            }
            await fetchTags()
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to save tag", variant: "destructive" })
            throw err
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this tag?")) return
        try {
            await tagService.deleteTag(id)
            toast({ title: "Deleted", description: "Tag deleted" })
            await fetchTags()
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Cannot delete tag in use", variant: "destructive" })
        }
    }

    if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tags Management</CardTitle>
                    <Button onClick={() => { setEditingTag(null); setIsDialogOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                    </Button>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search tags..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell className="font-medium">{tag.name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {tag.description || <span className="text-muted-foreground/50">No description</span>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={STATUS_VARIANTS[tag.status as keyof typeof STATUS_VARIANTS]}>
                                        {tag.status === 1 ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setEditingTag(tag)
                                                setIsDialogOpen(true)
                                            }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(tag.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {tags.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No tags found</div>
                )}

                <div className="mt-6 flex justify-between items-center">
                    <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <span>Page {page} of {Math.ceil(total / 10) || 1}</span>
                    <Button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </CardContent>

            <TagFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingTag={editingTag}
                onSave={handleSave}
            />
        </Card>
    )
}