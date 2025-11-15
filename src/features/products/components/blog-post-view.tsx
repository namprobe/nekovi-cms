// src/features/products/components/blog-post-view.tsx

"use client"

import { useBlogPostDetail } from "@/features/blog-post/hooks/use-blog-post-detail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { format } from "date-fns"
import { Calendar, User, Tag, FileText } from "lucide-react"

interface BlogPostViewProps {
    postId: string
}

export function BlogPostView({ postId }: BlogPostViewProps) {
    const { item: post, loading, error } = useBlogPostDetail(postId)

    if (loading) {
        return (
            <Card>
                <CardContent className="p-10">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 bg-muted rounded w-full animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !post) {
        return (
            <Card>
                <CardContent className="p-10 text-center text-red-500">
                    {error || "Không tìm thấy bài viết"}
                </CardContent>
            </Card>
        )
    }

    return (
        <article className="max-w-4xl mx-auto space-y-8">
            {/* Featured Image */}
            {post.featuredImage && (
                <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground">{post.title}</h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* Author */}
                {post.authorName && (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{post.authorName}</span>
                    </div>
                )}

                {post.authorName && <span>•</span>}

                {/* Publish Date */}
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time>{format(new Date(post.publishDate), "dd/MM/yyyy")}</time>
                </div>

                <span>•</span>

                {/* Category */}
                {post.postCategory && (
                    <Badge variant="secondary">{post.postCategory.name}</Badge>
                )}
            </div>

            {/* Tags */}
            {post.postTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {post.postTags.map((pt) => (
                        <Badge key={pt.id} variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {pt.tags[0]?.name || "Tag"}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Nội dung bài viết
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="prose prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </CardContent>
            </Card>

            {/* Status */}
            <div className="flex gap-2">
                <Badge variant={post.isPublished ? "success" : "warning"}>
                    {post.isPublished ? "Đã đăng" : "Bản nháp"}
                </Badge>
                <Badge variant={post.status === 1 ? "default" : "destructive"}>
                    {post.status === 1 ? "Hoạt động" : "Đã xóa"}
                </Badge>
            </div>
        </article>
    )
}