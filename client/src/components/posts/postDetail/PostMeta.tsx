import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { usePostContext } from '@/contexts';
import PostByline from './PostByline';

function PostMeta(): React.JSX.Element {
  const postContext = usePostContext();
  const { post } = postContext!;
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
      {crossPost && data.crosspost_parent_list && (
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
