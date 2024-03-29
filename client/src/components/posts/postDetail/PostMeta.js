import { useContext } from 'react';
import PostByline from './PostByline';
import { PostsContextData } from '../../../contexts';

function PostMeta() {
  const postContext = useContext(PostsContextData);
  const { post } = postContext;
  const { data, kind } = post;
  const sticky = data.stickied || false;

  const crossPost =
    (data.crosspost_parent && data.crosspost_parent_list[0]) || false;

  if (data.crosspost_parent && !data.crosspost_parent_list[0]) {
    // This is weird and occasionally happens.
    // console.log(data);
  }

  return (
    <>
      <PostByline data={data} kind={kind} />
      {crossPost && (
        <div>
          <i className="fas fa-random pe-2" title="Crossposted" />
          <PostByline data={data.crosspost_parent_list[0]} kind={kind} />
        </div>
      )}
      {sticky && <i className="fas fa-sticky-note px-2" title="Sticky" />}
    </>
  );
}

export default PostMeta;
