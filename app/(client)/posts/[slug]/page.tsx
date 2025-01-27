import React from 'react'
import { client } from '@/sanity/lib/client'
import Header from '@/components/Header'
import { Post } from '@/utils/interface'
import Link from 'next/link'
import { VT323 } from 'next/font/google'
import { notFound } from 'next/navigation'

interface Params {
  params: Promise<{ slug: string }>
}

const dateFont = VT323({ weight: '400', subsets: ['latin'] })

async function getPost(slug: string) {
  const query = `
  *[_type == "post" && slug.current == "${slug}"][0] {
    title,
    slug,
    publishedAt,
    excerpt,
    _id,
    "headings": body[style in ["h2", "h3", "h4", "h5", "h6"]],
    body,
    tags[]-> {
      _id,
      slug,
      name
    },
  }
  `

  const post = await client.fetch(query)
  return post
}

const Page = async ({ params }: Params) => {
  const { slug } = await params

  const post: Post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div>
      <Header title={post?.title} />
      <div className="text-center">
        <span className={`${dateFont.className} text-purple-500`}>
          {new Date(post?.publishedAt).toDateString()}
        </span>
        <div className="mt-5">
          {post?.tags?.map((tag) => (
            <Link key={tag?._id} href={`/tag/${tag.slug.current}`}>
              <span className="mr-2 p-1 rounded-sm text-sm lowercase dark:bg-gray-950 border dark:border-gray-900">
                #{tag.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page
