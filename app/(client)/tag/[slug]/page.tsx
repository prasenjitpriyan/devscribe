import React from 'react'
import Header from '@/components/Header'
import PostComponent from '@/components/PostComponent'
import { Post } from '@/utils/interface'
import { client } from '@/sanity/lib/client'

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params

  return {
    title: `#${slug}`,
    description: `Posts with the tag ${slug}`,
    openGraph: {
      title: `#${slug}`,
      description: `Posts with the tag ${slug}`,
      type: 'website',
      locale: 'en_US',
      url: `https://next-cms-blog-ce.vercel.app/tag/${slug}`,
      siteName: 'DevBlook'
    }
  }
}

async function getPostsByTag(tag: string) {
  const query = `
    *[_type == "post" && references(*[_type == "tag" && slug.current == "${tag}"]._id)]{
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      tags[]-> {
        _id,
        slug,
        name
      }
    }
  `
  const posts = await client.fetch(query)
  return posts
}

export const revalidate = 60

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

const Page = async ({ params }: ProjectPageProps) => {
  const { slug } = await params // Await the params promise to extract slug
  const posts: Array<Post> = await getPostsByTag(slug)

  return (
    <div>
      <Header title={`#${slug}`} tags />
      <div>
        {posts?.length > 0 &&
          posts.map((post) => (
            <PostComponent
              key={post._id || post.slug?.current} // Ensure unique key is set
              post={post}
            />
          ))}
      </div>
    </div>
  )
}

export default Page
