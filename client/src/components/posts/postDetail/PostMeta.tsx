import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { usePostContext } from '@/contexts';
import type { LinkData } from '@/types/redditApi';
import PostByline from './PostByline';

function PostMeta(): React.JSX.Element {
  const postContext = usePostContext();
  const { post } = postContext;
  const { data, kind } = post;

  // PostMeta is only used for link posts (t3), so we can safely assert LinkData
  const linkData = data as LinkData;

  const sticky = linkData.stickied ?? false;

  const crossPost =
    (linkData.crosspost_parent && linkData.crosspost_parent_list?.[0]) ?? false;

  if (linkData.crosspost_parent && !linkData.crosspost_parent_list?.[0]) {
    // This is weird and occasionally happens.
    // console.log(linkData);
  }

  return (
    <>
      <PostByline data={linkData} kind={kind} />
      {crossPost && linkData.crosspost_parent_list && (
        <div>
          <FontAwesomeIcon
            className="pe-2"
            icon={faRandom}
            title="Crossposted"
          />
          <PostByline data={linkData.crosspost_parent_list[0]} kind={kind} />
        </div>
      )}
      {sticky && (
        <FontAwesomeIcon className="px-2" icon={faStickyNote} title="Sticky" />
      )}
    </>
  );
}

export default PostMeta;
