export interface Post {
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  tags: Array<Tag>
  _id: string
  headings?: Array<HTMLHeadElement | string>
  comments?: Array<Comment>
}

export interface Tag {
  name: string
  slug: { current: string }
  _id: string
  postCount?: number
}

export interface Comment {
  name: string
  comment: string
  _createdAt: string
  _id: string
}
