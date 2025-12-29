import Image from "next/image";
import { PostItem } from "../post";

import classes from '@/components/Posts/detail/post-header.module.css';

export const PostHeader = ({ title, date, image }: Pick<PostItem, 'title' | 'date' | 'image'>) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const imagePath = `/images/posts/${image}`;

  return (
    <header className={classes.header}>
      <h1>{title}</h1>
      <Image src={imagePath} alt={title} width={200} height={150} />
    </header>
  );
}