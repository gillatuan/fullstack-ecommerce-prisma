import Image from "next/image";
import { PostItem } from "../post";

import classes from '@/components/Posts/detail/post-content.module.css';
import { PostHeader } from "./post-header";

export const PostContent = ({ post }: { post: PostItem }) => {

  return (
    <article className={classes.content}>
    <PostHeader title={post.title} image={post.image} date={post.date} />
    <div>{post.content}</div>
  </article>
  );
}