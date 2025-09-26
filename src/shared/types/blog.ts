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
export interface CreateBlogPostDto {
  title: string
  content: string
  postCategoryId?: string
  publishDate: Date
  isPublished: boolean
  featuredImagePath?: string
  tagIds: string[]
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

export interface BlogPostListItem {
  id: string
  title: string
  authorName: string
  categoryName?: string
  publishDate: Date
  isPublished: boolean
  featuredImagePath?: string
  status: number
}
