// src/shared/types/blog.ts
import type { BaseEntity } from "./common"

export interface BlogPost extends BaseEntity {
  title: string
  content: string
  authorId?: string
  postCategoryId?: string
  publishDate: Date
  isPublished: boolean
  featuredImagePath?: string
  author?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  category?: PostCategory
  tags?: PostTag[]
}

export interface PostCategory extends BaseEntity {
  name: string
  description?: string
  posts?: BlogPost[]
}

export interface PostTag extends BaseEntity {
  postId: string
  tagId: string
  post?: BlogPost
  tag?: {
    id: string
    name: string
    color?: string
  }
}

// DTOs
// Chỉ dùng khi create
export interface CreateBlogPostDto {
  title: string
  content: string
  postCategoryId?: string
  publishDate: Date
  isPublished: boolean
  featuredImageFile?: File
  tagIds?: string[]
  status?: number
}

export interface UpdateBlogPostDto {
  title?: string
  content?: string
  postCategoryId?: string
  publishDate?: Date
  isPublished?: boolean
  featuredImagePath?: string
  tagIds?: string[]
}

// src/entities/blog-post/types/blog-post.ts
export interface BlogPostListItem {
  id: string
  title: string
  authorName?: string
  postCategory?: {
    id: string
    name: string
  }
  publishDate: string | Date
  isPublished: boolean
  featuredImage?: string
  status: number
  postTags: { tagId: string; tagName: string }[]
}
