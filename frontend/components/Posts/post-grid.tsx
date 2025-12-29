import { PostItem } from "./post"
import classes from '@/components/Posts/posts-grid.module.css'
import { PostItemDetail } from "./post-item"

export const PostGrid = ({posts}: {posts: PostItem[] | []}) => {
    return <ul className={classes.grid}>{posts.map(post => <PostItemDetail key={post.id} post={post} />)}</ul>
}