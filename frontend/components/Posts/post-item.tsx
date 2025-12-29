import classes from '@/components/Posts/post-item.module.css';
import Image from "next/legacy/image";
import Link from "next/link";
import { PostItem } from "./post";

export const PostItemDetail = ( { post }: { post: PostItem } ) => {
  const formatDate = new Date( post.date ).toLocaleDateString( 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  } );

  const imagePath = `/images/posts/${ post.image }`;

  return <li className={classes.post}>
    <Link href={`/posts/${ post.slug }`}>
      <div className={classes.image}>
        <Image src={imagePath} alt={post.title} width={300} height={300} layout="responsive" />
      </div>
      <div className={classes.content}>
        <h3>{post.title}</h3>
        <time>{formatDate}</time>
        <p>{post.excerpt}</p>
      </div>
    </Link>
  </li>
}