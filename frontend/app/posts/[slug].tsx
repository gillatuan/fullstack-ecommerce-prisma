import { PostContent } from "@/components/Posts/detail/post-content";
import { PostItem } from "@/components/Posts/post";
import { useRouter } from "next/router";


const posts: PostItem[] | [] = [ {
  id: 'p1',
  title: 'Getting started with NextJS',
  excerpt: 'NextJS is the React framework for production - it makes building fullstack React apps and sites a breeze and ships with built-in SSR.',
  slug: 'getting-started-with-nextjs',
  content: 'NextJS is the React framework for production - it makes building fullstack React apps and sites a breeze and ships with built-in SSR.',
  image: 'nextjs.png',
  date: '2021-05-10'
},
{
  id: 'p2',
  title: 'Getting started with NestJS 2',
  excerpt: 'NestJS 2 is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
  slug: 'getting-started-with-nestjs-2',
  content: 'NestJS 2 is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
  image: 'nestjs.png',
  date: '2021-05-11'
} ]

export default function DetailPost () {
  const router = useRouter()
  const { slug } = router.query;
  const post = posts.find( post => post.slug === slug );

  if ( !post ) {
    return <p>Post not found!</p>
  }

  return <PostContent post={post} />
}