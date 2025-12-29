import classes from '@/components/FeaturedPosts/featured-posts.module.css';
import { PostGrid } from '@/components/Posts/post-grid';
import { PostItem } from "../Posts/post";

export const FeaturedPosts = ( { posts }: { posts: PostItem[] | [] } ) => {
    return (
        <section className={classes.latest}>
            <h2>Featured Posts</h2>
            <PostGrid posts={posts} />
        </section>
    )
}