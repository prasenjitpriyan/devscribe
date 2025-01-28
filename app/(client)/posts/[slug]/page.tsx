/* eslint-disable @typescript-eslint/no-explicit-any */
import AddComment from '@/components/AddComment'
import AllComments from '@/components/AllComments'
import Header from '@/components/Header'
import Toc from '@/components/Toc'
import { slugify } from '@/utils/helpers'
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import { Metadata } from 'next'
import { VT323 } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

const dateFont = VT323({ weight: '400', subsets: ['latin'] })

interface Params {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getPost(slug: string, commentsOrder: string = 'desc') {
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
      "comments": *[_type == "comment" && post._ref == ^._id ] | order(_createdAt ${commentsOrder}) {
        name,
        comment,
        _createdAt,
      }
    }
  `

  const post = await client.fetch(query)
  return post
}

export const revalidate = 60

export async function generateMetadata({
  params
}: Params): Promise<Metadata | undefined> {
  const resolvedParams = await params

  const post = await getPost(resolvedParams?.slug)
  if (!post) {
    return
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'en_US',
      url: `https://your-domain.com/${resolvedParams.slug}`,
      siteName: 'Your Site Name',
      images: [
        // Add images for OpenGraph if available.
      ]
    }
  }
}

const page = async ({ params, searchParams }: Params) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const commentsOrder = resolvedSearchParams?.comments || 'desc'

  if (!resolvedParams?.slug) {
    notFound()
    return
  }

  const post = await getPost(resolvedParams?.slug, commentsOrder.toString())

  if (!post) {
    notFound()
    return
  }

  return (
    <div className="">
      <Header title={post?.title} />
      <div className="text-center">
        <span className={`${dateFont?.className} text-purple-500`}>
          {new Date(post?.publishedAt).toDateString()}
        </span>
        <div className="mt-5">
          {post?.tags?.map((tag: any) => (
            <Link key={tag?._id} href={`/tag/${tag.slug.current}`}>
              <span className="mr-2 p-1 rounded-sm text-sm lowercase dark:bg-gray-950 border dark:border-gray-900">
                #{tag.name}
              </span>
            </Link>
          ))}
        </div>
        <Toc headings={post?.headings} />
        <div className={richTextStyles}>
          <PortableText
            value={post?.body}
            components={portableTextComponents}
          />
          <AddComment postId={post?._id} />
          <AllComments
            comments={post?.comments || []}
            slug={post?.slug?.current}
            commentsOrder={commentsOrder.toString()}
          />
        </div>
      </div>
    </div>
  )
}

export default page

const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <Image
        src={urlForImage(value).url()}
        alt={value.alt || 'Post Image'}
        width={700}
        height={400}
        className="rounded-md mx-auto"
        priority
      />
    )
  },
  block: {
    h1: ({ children }: any) => (
      <h1 id={slugify(children[0])} className="text-4xl font-bold mt-6 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 id={slugify(children[0])} className="text-3xl font-bold mt-6 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3
        id={slugify(children[0])}
        className="text-2xl font-semibold mt-5 mb-3"
      >
        {children}
      </h3>
    ),
    normal: ({ children }: any) => <p className="text-lg my-4">{children}</p>
  },
  marks: {
    link: ({ value, children }: any) => (
      <a
        href={value.href}
        className="text-blue-500 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
}

const richTextStyles = `
  mt-14
  text-justify
  max-w-2xl
  m-auto
  prose
  prose-headings:my-5
  prose-heading:text-2xl
  prose-p:mb-5
  prose-p:leading-7
  prose-li:list-disc
  prose-li:leading-7
  prose-li:ml-4
`
