import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import PostByline from './PostByline';
import { PostsContextData } from '../../../contexts';
import type { LinkData } from '../../../types/redditApi';

function PostMeta(): React.JSX.Element {
  const postContext = useContext(PostsContextData) as {
    post: { data: LinkData; kind: string };
  };
  const { post } = postContext;
  const { data, kind } = post;
  const sticky = data.stickied ?? false;

  const crossPost =
    (data.crosspost_parent && data.crosspost_parent_list?.[0]) ?? false;

  if (data.crosspost_parent && !data.crosspost_parent_list?.[0]) {
    // This is weird and occasionally happens.
    // console.log(data);
  }

  return (
    <>
      <PostByline data={data} kind={kind} />
      {crossPost && (
        <div>
          <FontAwesomeIcon
            className="pe-2"
            icon={faRandom}
            title="Crossposted"
          />
          <PostByline data={data.crosspost_parent_list[0]} kind={kind} />
        </div>
      )}
      {sticky && (
        <FontAwesomeIcon className="px-2" icon={faStickyNote} title="Sticky" />
      )}
    </>
  );
}

export default PostMeta;
