// Reddit API TypeScript Definitions
// Based on https://www.reddit.com/dev/api/

export type RedditKind =
  | `t1_${string}` // Comment
  | `t2_${string}` // Account
  | `t3_${string}` // Link
  | `t4_${string}` // Message
  | `t5_${string}` // Subreddit
  | `t6_${string}` // Award
  | 'Listing'
  | 'more'
  | 'UserList' // For friend lists (deprecated)
  | 'TrophyList'
  | 'KarmaList'
  | 'subreddit_settings' // For /r/{subreddit}/about/edit
  | 'modaction'
  | 'wikipage'
  | 'wikipagelisting'
  | 'LabeledMulti' // MultiReddit object itself
  | 'LabeledMultiDescription' // Description for a MultiReddit
  | 'LiveUpdate'
  | 'LiveUpdateEvent';

/**
 * Base interface for any Reddit "Thing".
 * @template T The type of the 'data' field.
 */
export interface Thing<T> {
  /** The kind of object. e.g., "t1" for Comment, "t2" for Account. */
  kind: RedditKind;
  /** The data payload for this object. */
  data: T;
}

/**
 * Represents a listing of Reddit Things, used for paginated results.
 * @template TData The type of the 'data' field for each child Thing in the listing.
 */
export interface Listing<TData> {
  kind: 'Listing';
  data: {
    /** The full name of the listing item that comes before this page. null if there is no previous page. */
    before: string | null;
    /** The full name of the listing item that comes after this page. null if there is no next page. */
    after: string | null;
    /** A list of Things. */
    children: Thing<TData>[];
    /** The number of items in the children array. */
    dist?: number;
    /** Geo filter. */
    geo_filter?: string | null;
    /** A modhash, if the user is logged in. This is a string that Reddit uses to prevent CSRF. (Not needed for OAuth) */
    modhash?: string | null; // This field might still appear in responses even if not needed for requests
  };
}

/**
 * Generic type for simple API responses, often an empty object on success
 * or an object with errors.
 */
export interface ApiResponse {
  json?: {
    errors?: ApiError[];
    data?: Record<string, unknown>;
    ratelimit?: number;
  };
  // For robustness, allow any other properties that might appear.
  [key: string]: unknown;
}

/**
 * Represents an error from the Reddit API.
 */
export type ApiError =
  | [string, string, string | null]
  | { error: string; message: string; reason?: string; explanation?: string };

// -----------------------------------------------------------------------------
// Common Reddit Object Data Interfaces
// -----------------------------------------------------------------------------

export interface CommentData {
  id: string;
  name: `t1_${string}`;
  author: string;
  author_fullname?: `t2_${string}`;
  author_flair_text?: string | null;
  author_flair_css_class?: string | null;
  body: string;
  body_html?: string;
  created: number;
  created_utc: number;
  ups: number;
  downs: number;
  score: number;
  permalink: string;
  parent_id: `t1_${string}` | `t3_${string}`;
  subreddit: string;
  subreddit_id: `t5_${string}`;
  subreddit_name_prefixed: string;
  subreddit_type?: SubredditType;
  replies?: Listing<CommentData | MoreChildrenData> | '';
  link_id?: `t3_${string}`;
  banned_by?: string | null;
  approved_by?: string | null;
  approved_at_utc?: number | null;
  banned_at_utc?: number | null;
  can_mod_post?: boolean;
  distinguished?: 'moderator' | 'admin' | 'special' | null;
  edited: boolean | number;
  gilded: number;
  likes?: boolean | null;
  num_reports?: number | null;
  saved?: boolean;
  stickied?: boolean;
  depth?: number;
  collapsed?: boolean;
  collapsed_reason?: string | null;
  score_hidden?: boolean;
  controversiality?: number;
}

export interface MoreChildrenData {
  count: number;
  name: 'more';
  id: string;
  parent_id?: `t1_${string}` | `t3_${string}`;
  depth?: number;
  children: string[];
}

export interface AccountData {
  id: string;
  name: string;
  is_employee: boolean;
  is_friend?: boolean;
  is_mod: boolean;
  is_gold: boolean;
  is_sponsor?: boolean;
  is_suspended?: boolean;
  created: number;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  total_karma?: number;
  awardee_karma?: number;
  awarder_karma?: number;
  verified?: boolean;
  icon_img: string;
  pref_show_snoovatar?: boolean;
  snoovatar_img?: string;
  snoovatar_size?: [number, number] | null;
  over_18?: boolean;
  has_verified_email: boolean | null;
  can_create_subreddit?: boolean;
  coins?: number;
  gold_creddits?: number;
  gold_expiration?: number | null;
  features?: Record<string, boolean | Record<string, unknown>>;
  inbox_count?: number;
  has_mail?: boolean;
  pref_nightmode?: boolean;
  pref_autoplay?: boolean;
  pref_video_autoplay?: boolean;
  pref_clickgadget?: number;
  pref_geopopular?: string;
  pref_no_profanity?: boolean;
  pref_show_presence?: boolean;
  pref_show_trending?: boolean;
  pref_show_twitter?: boolean;
  pref_top_karma_subreddits?: boolean;
  subreddit?: UserProfileSubredditData;
  accept_followers?: boolean;
  force_password_reset?: boolean;
  has_android_subscription?: boolean;
  has_external_account?: boolean;
  has_gold_subscription?: boolean;
  has_ios_subscription?: boolean;
  has_paypal_subscription?: boolean;
  has_stripe_subscription?: boolean;
  has_subscribed?: boolean;
  has_subscribed_to_premium?: boolean;
  has_visited_new_profile?: boolean;
  hide_from_robots?: boolean;
  in_beta?: boolean;
  in_redesign_beta?: boolean;
  linked_identities?: Array<unknown>;
  num_friends?: number;
  oauth_client_id?: string;
  password_set?: boolean;
  seen_give_award_tooltip?: boolean;
  seen_layout_switch?: boolean;
  seen_premium_adblock_modal?: boolean;
  seen_redesign_modal?: boolean;
  seen_subreddit_chat_ftux?: boolean;
  suspension_expiration_utc?: number | null;
}

export interface UserProfileSubredditData extends SubredditData {
  default_set: boolean;
  user_is_contributor: boolean;
  user_is_moderator: boolean;
  user_is_subscriber: boolean;
  user_is_banned: boolean;
  user_is_muted: boolean;
}

export interface LinkData {
  id: string;
  name: `t3_${string}`;
  title: string;
  author: string;
  author_fullname?: `t2_${string}`;
  author_flair_text?: string | null;
  author_flair_css_class?: string | null;
  created: number;
  created_utc: number;
  ups: number;
  downs: number;
  score: number;
  num_comments: number;
  permalink: string;
  url: string;
  selftext: string;
  selftext_html: string | null;
  is_self: boolean;
  is_video: boolean;
  is_original_content?: boolean;
  is_meta?: boolean;
  is_reddit_media_domain?: boolean;
  is_robot_indexable?: boolean;
  domain: string;
  subreddit: string;
  subreddit_id: `t5_${string}`;
  subreddit_name_prefixed: string;
  subreddit_subscribers?: number;
  subreddit_type?: SubredditType;
  thumbnail: string;
  thumbnail_height?: number | null;
  thumbnail_width?: number | null;
  stickied: boolean;
  locked: boolean;
  over_18: boolean;
  spoiler?: boolean;
  hidden?: boolean;
  visited?: boolean;
  pinned?: boolean;
  archived?: boolean;
  can_gild?: boolean;
  gilded: number;
  likes?: boolean | null;
  saved?: boolean;
  clicked?: boolean;
  media?: Media | null;
  media_embed?: MediaEmbed;
  secure_media?: Media | null;
  secure_media_embed?: MediaEmbed;
  preview?: Preview;
  post_hint?:
    | 'self'
    | 'link'
    | 'image'
    | 'hosted:video'
    | 'rich:video'
    | 'gallery';
  crosspost_parent_list?: LinkData[];
  crosspost_parent?: `t3_${string}`;
  link_flair_text?: string | null;
  link_flair_css_class?: string | null;
  link_flair_template_id?: string | null;
  link_flair_richtext?: RichTextFlair[];
  link_flair_text_color?: 'dark' | 'light';
  link_flair_background_color?: string;
  suggested_sort?: string | null;
  view_count?: number | null;
  whitelist_status?: string | null;
  contest_mode?: boolean;
  mod_reports?: Array<[string, string]>;
  user_reports?: Array<[string, string, boolean, boolean]>;
  num_reports?: number | null;
  distinguished?: 'moderator' | 'admin' | 'special' | null;
}

export interface RichTextFlair {
  e: 'text' | 'emoji';
  t?: string;
  u?: string;
}

export interface Media {
  type?: string;
  oembed?: OEmbed;
  reddit_video?: RedditVideo;
}

export interface OEmbed {
  provider_url?: string;
  provider_name?: string;
  title?: string;
  type?: string;
  html?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  width?: number;
  height?: number;
  author_name?: string;
  author_url?: string;
  version?: string;
}

export interface RedditVideo {
  dash_url: string;
  duration: number;
  fallback_url: string;
  height: number;
  hls_url: string;
  is_gif: boolean;
  scrubber_media_url: string;
  transcoding_status: string;
  width: number;
}

export interface MediaEmbed {
  content?: string;
  width?: number;
  height?: number;
  scrolling?: boolean;
}

export interface Preview {
  images: ImagePreviewSource[];
  enabled: boolean;
  reddit_video_preview?: RedditVideo;
}

export interface ImagePreviewSource {
  source: ImageDetails;
  resolutions: ImageDetails[];
  variants: {
    gif?: ImageVariant;
    mp4?: ImageVariant;
    nsfw?: ImageVariant;
    obfuscated?: ImageVariant;
  };
  id: string;
}

export interface ImageDetails {
  url: string;
  width: number;
  height: number;
}

export interface ImageVariant {
  source: ImageDetails;
  resolutions: ImageDetails[];
}

export interface MessageData {
  id: string;
  name: `t4_${string}`;
  author: string | null;
  author_fullname?: `t2_${string}` | null;
  body: string;
  body_html?: string;
  created: number;
  created_utc: number;
  dest: string;
  distinguished?: 'moderator' | 'admin' | null;
  first_message?: number | null;
  first_message_name?: `t4_${string}` | null;
  new: boolean;
  parent_id?: `t4_${string}` | null;
  replies?: Listing<MessageData> | '';
  subject: string;
  subreddit?: string | null;
  subreddit_name_prefixed?: string | null;
  was_comment: boolean;
  context?: string;
  link_title?: string;
  num_comments?: number;
  score?: number;
}

export type SubredditType =
  | 'public'
  | 'private'
  | 'restricted'
  | 'archived'
  | 'gold_restricted'
  | 'gold_only'
  | 'employees_only'
  | 'user';

export interface SubredditData {
  id: string;
  name: `t5_${string}`;
  display_name: string;
  display_name_prefixed: string;
  title: string;
  description: string | null;
  description_html: string | null;
  public_description: string | null;
  public_description_html?: string | null;
  subscribers: number | null;
  /** @deprecated Reddit removed this field in 2024. Historically showed users active in the past 15 minutes. */
  accounts_active?: number | null;
  /** @deprecated Field is no longer reliably populated as of 2024. */
  accounts_active_is_fuzzed?: boolean;
  /** @deprecated Reddit removed this field in 2024. Was a duplicate of accounts_active. */
  active_user_count?: number | null;
  created: number;
  created_utc: number;
  lang: string;
  over18: boolean;
  advertiser_category?: string | null;
  subreddit_type: SubredditType;
  header_img: string | null;
  header_size: [number, number] | null;
  header_title?: string | null;
  icon_img: string | null;
  icon_size?: [number, number] | null;
  banner_img?: string | null;
  banner_background_image?: string | null;
  banner_background_color?: string;
  banner_size?: [number, number] | null;
  mobile_banner_image?: string | null;
  primary_color?: string;
  key_color?: string;
  url: string;
  user_is_moderator?: boolean | null;
  user_is_contributor?: boolean | null;
  user_is_subscriber?: boolean | null;
  user_is_banned?: boolean | null;
  user_is_muted?: boolean | null;
  user_can_flair_in_sr?: boolean | null;
  user_flair_richtext?: RichTextFlair[];
  user_flair_text?: string | null;
  user_flair_text_color?: 'dark' | 'light' | null;
  user_flair_background_color?: string | null;
  user_flair_template_id?: string | null;
  user_flair_enabled_in_sr?: boolean;
  user_has_favorited?: boolean;
  submit_text?: string;
  submit_text_html?: string;
  submit_link_label?: string | null;
  submit_text_label?: string | null;
  allow_images?: boolean;
  allow_videos?: boolean;
  allow_videogifs?: boolean;
  allow_galleries?: boolean;
  community_icon?: string;
  emojis_enabled?: boolean;
  can_assign_user_flair?: boolean;
  can_assign_link_flair?: boolean;
  show_media?: boolean;
  show_media_preview?: boolean;
  submission_type?: 'any' | 'link' | 'self';
  spoilers_enabled?: boolean;
  wiki_enabled?: boolean | null;
  suggested_comment_sort?: string | null;
}

export interface TrophyData {
  id: string | null;
  name: string;
  description: string | null;
  icon_70: string;
  icon_40: string;
  url: string | null;
  award_id: string | null;
}

export interface ModActionData {
  id: `modaction_${string}`;
  action: string;
  created_utc: number;
  details: string;
  mod: string;
  mod_id36: string;
  sr_id36: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  target_author: string | null;
  target_body: string | null;
  target_fullname: `t1_${string}` | `t2_${string}` | `t3_${string}` | null;
  target_permalink: string | null;
  target_title: string | null;
  description?: string | null;
}

/** Data for a MultiReddit (Custom Feed) */
export interface LabeledMultiData {
  can_edit: boolean;
  display_name: string;
  name: string; // The unique name / slug
  description_html: string | null;
  description_md: string | null;
  created: number;
  created_utc: number;
  icon_url: string | null;
  key_color: string | null; // Hex color
  subreddits: Array<{ name: string }>; // List of subreddit names (display names)
  visibility: 'private' | 'public' | 'hidden';
  path: string; // e.g., /user/username/m/multiname/
  owner: `t2_${string}`; // Fullname of the owner
  owner_id: string; // ID of the owner
  copied_from?: string | null; // Fullname of multireddit this was copied from
  icon_name?: string | null;
  weighting_scheme?: 'classic' | 'fresh';
  num_subscribers?: number; // Only for public multis
  // ... and potentially more fields
}

/** Data for a Subreddit Rule */
export interface SubredditRule {
  kind: 'all' | 'link' | 'comment'; // Type of rule
  description: string;
  short_name: string; // The rule text itself
  violation_reason: string; // Short reason displayed to user
  created_utc: number;
  priority: number; // Order of the rule
  description_html?: string;
}

/** Data for site-wide rule reporting flow */
export interface SiteRuleFlowEntry {
  reason_text_show: boolean;
  reason_text: string;
  next_step_reason_text: string | null;
  next_step_header_text: string | null;
  next_step_type: string | null; // e.g. "link_url_text_box"
}

/** Data for /r/{subreddit}/about/edit (Subreddit Settings) */
export interface SubredditSettingsData extends SubredditData {
  default_set?: boolean;
  spam_links?: 'low' | 'high' | 'all';
  spam_selfposts?: 'low' | 'high' | 'all';
  spam_comments?: 'low' | 'high' | 'all';
  // Many more fields related to subreddit settings...
  allow_top?: boolean;
  exclude_banned_modqueue?: boolean;
  show_media_preview?: boolean;
  // This is a very large object, essentially an extended SubredditData
  // with all editable settings.
}

/** Data for a friend (used in deprecated friend APIs) */
export interface FriendData {
  name: string; // Username
  id: `t2_${string}`; // User fullname / ID
  date: number; // Timestamp when friended
  rel_id?: string; // Relation ID, used for friend requests context
}

// -----------------------------------------------------------------------------
// API Endpoint Input and Output Types
// -----------------------------------------------------------------------------

export interface PaginationQueryParams {
  after?: string;
  before?: string;
  limit?: number;
  count?: number;
  show?: 'all' | 'given';
  sr_detail?: boolean | string | number; // Can be 0/1 or true/false
  raw_json?: 1; // Common param to ensure non-HTML escaped JSON
}

export interface ThingIdParam {
  id:
    | `t1_${string}`
    | `t2_${string}`
    | `t3_${string}`
    | `t4_${string}`
    | `t5_${string}`;
}

export interface SubredditListingsParams extends PaginationQueryParams {
  t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  g?: string;
  include_categories?: boolean; // Present in user's JS code, not standard for /r/{sr}/{sort}
}
export type SubredditListingsResponse = Listing<LinkData>;

export type InfoResponse = Listing<LinkData | CommentData | SubredditData>;
export interface InfoParams {
  id?: string;
  url?: string;
  raw_json?: 1;
}

export interface VoteParams {
  id: `t1_${string}` | `t3_${string}`;
  dir: -1 | 0 | 1;
  rank?: number;
}
export type VoteResponse = ApiResponse;

export interface SaveParams {
  id: `t1_${string}` | `t3_${string}`;
  category?: string;
}
export type SaveResponse = ApiResponse;

export interface UnsaveParams {
  id: `t1_${string}` | `t3_${string}`;
}
export type UnsaveResponse = ApiResponse;

export interface HideParams {
  id: `t3_${string}` | string; // Can be comma-separated list
}
export type HideResponse = ApiResponse;

export interface UnhideParams {
  id: `t3_${string}` | string; // Can be comma-separated list
}
export type UnhideResponse = ApiResponse;

export interface ReportParams {
  api_type: 'json';
  thing_id: `t1_${string}` | `t3_${string}` | `t4_${string}`;
  reason?: string;
  other_reason?: string;
  rule_reason?: string;
  site_reason?: string;
  from_help_desk?: boolean;
  modmail_conv_id?: string;
}
export type ReportResponse = ApiResponse;

export interface PostCommentBody {
  api_type: 'json';
  text: string;
  thing_id: `t1_${string}` | `t3_${string}`;
  return_rtjson?: boolean;
  richtext_json?: string;
}
export interface PostCommentResponse extends ApiResponse {
  json: {
    errors: ApiError[];
    data?: { things: Thing<CommentData>[] };
  };
}

export interface SubmitBody {
  api_type: 'json';
  kind: 'link' | 'self' | 'image' | 'video' | 'videogif' | 'gallery';
  sr: string;
  title: string;
  url?: string;
  text?: string;
  richtext_json?: string;
  resubmit?: boolean;
  sendreplies?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
  flair_id?: string;
  flair_text?: string;
  collection_id?: string;
  event_start?: string;
  event_end?: string;
  event_tz?: string;
  items?: Array<{ caption?: string; outbound_url?: string; media_id: string }>;
  validate_on_submit?: boolean;
}
export interface SubmitResponse extends ApiResponse {
  json: {
    errors: ApiError[];
    data?: {
      url: string;
      id: string;
      name: `t3_${string}`;
      drafts_count?: number;
    };
  };
}

export interface DeleteParams {
  id: `t1_${string}` | `t3_${string}`;
}
export type DeleteResponse = ApiResponse;

export interface EditUserTextParams {
  api_type: 'json';
  thing_id: `t1_${string}` | `t3_${string}`;
  text: string;
  return_rtjson?: boolean;
  richtext_json?: string;
}
export interface EditUserTextResponse extends ApiResponse {
  json: {
    errors: ApiError[];
    data?: { things: Thing<CommentData | LinkData>[] };
  };
}

export interface SubscribeParams {
  action: 'sub' | 'unsub';
  sr?: `t5_${string}`;
  sr_name?: string;
  skip_initial_defaults?: boolean;
}
export type SubscribeResponse = ApiResponse;

export interface FlairInfo {
  flair_css_class: string | null;
  flair_template_id: string | null;
  flair_text: string | null;
  flair_richtext: RichTextFlair[];
  flair_position?: 'left' | 'right' | '';
  user?: string;
  text_editable?: boolean;
  text_color?: 'light' | 'dark';
  background_color?: string;
  mod_only?: boolean;
  css_class?: string;
  text?: string;
  type?: 'text' | 'richtext';
  id?: string;
}
export type LinkFlairListResponse = FlairInfo[];
export interface UserFlairEntry extends FlairInfo {
  user: `t2_${string}`;
}
export type UserFlairListResponse = UserFlairEntry[];

export interface SelectFlairParams {
  api_type: 'json';
  flair_template_id?: string;
  link?: `t3_${string}`;
  name?: string;
  sr: string;
  text?: string;
  css_class?: string;
  background_color?: string;
  text_color?: 'light' | 'dark';
  richtext_json?: string;
}
export type SelectFlairResponse = ApiResponse;

export interface ClearFlairTemplatesParams {
  api_type: 'json';
  flair_type: 'USER_FLAIR' | 'LINK_FLAIR';
  sr: string;
}
export type ClearFlairTemplatesResponse = ApiResponse;

export interface FlairTemplateParams {
  api_type: 'json';
  flair_template_id?: string;
  text: string;
  text_editable: boolean;
  css_class?: string;
  text_color?: 'light' | 'dark';
  background_color?: string;
  mod_only?: boolean;
  allow_assign_self?: boolean;
  flair_type: 'USER_FLAIR' | 'LINK_FLAIR';
}
export interface FlairTemplateResponse extends ApiResponse {
  id?: string; // FlairInfo fields
}

export type MessageListingResponse = Listing<MessageData>;
export interface MessageListingParams extends PaginationQueryParams {
  mark?: boolean;
}

export interface ComposeMessageParams {
  api_type: 'json';
  subject: string;
  text: string;
  to: string;
  from_sr?: string;
  gRecaptchaResponse?: string;
}
export interface ComposeMessageResponse extends ApiResponse {
  json: { errors: ApiError[]; data?: { things: Thing<MessageData>[] } };
}

export interface MarkMessageReadUnreadParams {
  id: string;
}
export type MarkMessageReadUnreadResponse = ApiResponse;

export interface BlockUserParams {
  id?: `t2_${string}`;
  name?: string;
  container?: `t4_${string}`;
  type?: 'enemy'; // For blocking. 'friend' for unblocking.
}
export type BlockUserResponse = ApiResponse;

export interface ApproveParams {
  id: `t1_${string}` | `t3_${string}`;
}
export type ApproveResponse = ApiResponse;

export interface RemoveParams {
  id: `t1_${string}` | `t3_${string}`;
  spam: boolean;
}
export type RemoveResponse = ApiResponse;

export interface IgnoreReportsParams {
  id: `t1_${string}` | `t3_${string}`;
}
export type IgnoreReportsResponse = ApiResponse;

export interface DistinguishParams {
  api_type: 'json';
  how: 'yes' | 'no' | 'admin' | 'special';
  id: `t1_${string}` | `t3_${string}`;
  sticky?: boolean;
}
export interface DistinguishResponse extends ApiResponse {
  json: {
    errors: ApiError[];
    data?: { things: Thing<CommentData | LinkData>[] };
  };
}

export interface SetSubredditStickyParams {
  api_type: 'json';
  id: `t3_${string}`;
  state: boolean;
  num?: 1 | 2;
}
export type SetSubredditStickyResponse = ApiResponse;

export interface ModLogParams extends PaginationQueryParams {
  type?: string;
  mod?: string;
}
export type ModLogResponse = Listing<ModActionData>;

export interface ModQueueListingParams extends PaginationQueryParams {
  only?: 'links' | 'comments';
}
export type ModQueueListingResponse = Listing<LinkData | CommentData>;

export interface AcceptModeratorInviteParams {
  sr: string;
  api_type: 'json';
}
export type AcceptModeratorInviteResponse = ApiResponse;

export interface LeaveModeratorParams {
  id: `t5_${string}`;
}
export type LeaveModeratorResponse = ApiResponse;

export type MeResponse = Thing<AccountData & UserPreferences>;
export type GetUserPreferencesResponse = UserPreferences;
export type PatchUserPreferencesBody = Partial<UserPreferences> & {
  api_type: 'json';
};
export type PatchUserPreferencesResponse = UserPreferences;

export interface UserPreferences {
  accept_pms?: 'everyone' | 'whitelisted';
  activity_relevant_ads?: boolean;
  allow_clicktracking?: boolean;
  beta?: boolean;
  clickgadget?: boolean;
  collapse_read_messages?: boolean;
  compress?: boolean;
  country_code?: string;
  default_comment_sort?:
    | 'confidence'
    | 'top'
    | 'new'
    | 'controversial'
    | 'old'
    | 'qa'
    | 'live';
  default_theme_sr?: string | null;
  domain_details?: boolean;
  email_chat_request?: boolean;
  email_comment_reply?: boolean;
  email_community_discovery?: boolean;
  email_digests?: boolean;
  email_messages?: boolean;
  email_post_reply?: boolean;
  email_private_message?: boolean;
  email_unsubscribe_all?: boolean;
  email_upvote_comment?: boolean;
  email_upvote_post?: boolean;
  email_user_new_follower?: boolean;
  email_username_mention?: boolean;
  enable_default_themes?: boolean;
  enable_followers?: boolean;
  feed_recommendations_enabled?: boolean;
  g?: string;
  hide_ads?: boolean;
  hide_downs?: boolean;
  hide_from_robots?: boolean;
  hide_ups?: boolean;
  highlight_controversial?: boolean;
  highlight_new_comments?: boolean;
  ignore_suggested_sort?: boolean;
  in_redesign_beta?: boolean;
  label_nsfw?: boolean;
  lang?: string;
  legacy_search?: boolean;
  live_orangereds?: boolean;
  mark_messages_read?: boolean;
  media?: 'on' | 'off' | 'subreddit';
  media_preview?: 'on' | 'off' | 'subreddit';
  min_comment_score?: number;
  min_link_score?: number;
  monitor_mentions?: boolean;
  newwindow?: boolean;
  nightmode?: boolean;
  no_profanity?: boolean;
  num_comments?: number;
  numsites?: number;
  organic?: boolean;
  other_theme?: string;
  over_18?: boolean;
  private_feeds?: boolean;
  profile_opt_out?: boolean;
  public_server_seconds?: boolean;
  public_votes?: boolean;
  search_include_over_18?: boolean;
  send_crosspost_messages?: boolean;
  send_welcome_messages?: boolean;
  show_flair?: boolean;
  show_gold_expiration?: boolean;
  show_link_flair?: boolean;
  show_location_based_recommendations?: boolean;
  show_stylesheets?: boolean;
  show_trending?: boolean;
  show_twitter?: boolean;
  show_user_flair?: boolean;
  store_visits?: boolean;
  survey_last_seen_time?: number | null;
  theme_selector?: string;
  third_party_data_personalized_ads?: boolean;
  third_party_site_data_personalized_ads?: boolean;
  third_party_site_data_personalized_content?: boolean;
  threaded_messages?: boolean;
  threaded_modmail?: boolean;
  top_karma_subreddits?: boolean;
  treat_as_unlinked?: boolean;
  use_global_defaults?: boolean;
  video_autoplay?: boolean;
  [key: string]: unknown;
}

export interface KarmaBreakdown {
  sr: string;
  comment_karma: number;
  link_karma: number;
}
export type UserKarmaResponse = { kind: 'KarmaList'; data: KarmaBreakdown[] };
export type UserTrophiesResponse = {
  kind: 'TrophyList';
  data: { trophies: Thing<TrophyData>[] };
};

/** Query parameters for GET /search.json or GET /r/{subreddit}/search.json */
export interface SearchParams extends PaginationQueryParams {
  q: string;
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  syntax?: 'cloudsearch' | 'lucene' | 'plain';
  t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  restrict_sr?: boolean;
  type?: string; // Comma-separated: "sr", "link", "user"
  include_facets?: boolean;
  category?: string | null; // In user's JS, not standard for search
  is_multi?: 1 | undefined; // For multireddit search
}
export type SearchResponse = Listing<LinkData | SubredditData | AccountData>;

export type SubredditAboutResponse = Thing<SubredditData>;
export type CommentsResponse = [
  Listing<LinkData>,
  Listing<CommentData | MoreChildrenData>,
];
export interface CommentsPathParams {
  article: string; // ID36 of post
  comment?: string; // Optional: ID36 of a specific comment
  context?: number; // (0-8)
  depth?: number;
  limit?: number;
  sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'qa' | 'live';
  sr_detail?: boolean | number;
  threaded?: boolean;
  truncate?: number;
  raw_json?: 1;
}

export type UserAboutResponse = Thing<AccountData>;
export interface UserActivityParams extends PaginationQueryParams {
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  type?: 'links' | 'comments' | 'overview' | 'submitted' | 'gilded';
  username?: string;
  show?: 'given'; // for user/{username}/gilded/given
  include_categories?: boolean; // In user's JS, not standard
}
export type UserActivityResponse = Listing<LinkData | CommentData>;

// MultiReddits
export interface MultiMineParams {
  expand_srs?: boolean;
  raw_json?: 1;
}
export type MultiMineResponse = LabeledMultiData[];

export interface MultiPathParams {
  multipath: string;
  raw_json?: 1;
}
export type MultiInfoResponse = Thing<LabeledMultiData>;

export interface MultiCreatePayload {
  model: string;
  api_type: 'json';
  expand_srs?: boolean;
}
export interface MultiAddSubredditPayload {
  model: string;
  multipath: string;
  srname: string;
}
export interface MultiListingParams extends SubredditListingsParams {}
export type MultiListingResponse = Listing<LinkData>;

// Duplicates
export interface DuplicatesParams extends PaginationQueryParams {
  article_id: string;
  crossposts_only?: boolean;
  sort?: 'num_comments' | 'new';
  sr?: string | null;
}
export type DuplicatesResponse = [Listing<LinkData>, Listing<LinkData>];

// Searches
export interface SearchRedditNamesParams {
  query: string;
  exact?: boolean;
  include_over_18?: boolean;
  include_unadvertisable?: boolean;
  type?: 'sr' | 'user';
  raw_json?: 1;
}
export interface SearchRedditNamesResponse {
  names?: string[];
  subreddits?: Array<{
    name: string;
    id?: string;
    num_subscribers?: number;
  }>;
  users?: Array<{
    name: string;
    id?: string;
  }>;
}

export interface SearchSubredditsPostBody {
  query: string;
  exact?: boolean;
  include_over_18?: boolean;
  include_unadvertisable?: boolean;
  raw_json?: 1;
  api_type: 'json';
}
export interface SearchSubredditsResponse {
  subreddits: Array<{
    name: string;
    active_user_count?: number;
    icon_img?: string;
    key_color?: string;
    subscriber_count?: number;
    is_chat_post_feature_enabled?: boolean;
    allow_chat_post_creation?: boolean;
    allow_images?: boolean;
  }>;
}

// Favorites
export interface FavoriteBodyParams {
  make_favorite: boolean | string;
  sr_name: string;
}
export type FavoriteResponse = ApiResponse;

// Subreddit Listings
export interface SubredditsListingParams extends PaginationQueryParams {
  show?: 'all' | 'given';
  sr_detail?: boolean | number;
}
export type SubredditsListingResponse = Listing<SubredditData>;

// Subreddit About Details
export interface SubredditRulesResponse {
  rules: SubredditRule[];
  site_rules: string[];
  site_rules_flow?: SiteRuleFlowEntry[];
}

export interface SubredditTrafficData {
  day: Array<[number, number, number, number?]>;
  hour: Array<[number, number, number, number?]>;
  month: Array<[number, number, number, number?]>;
}
export type SubredditTrafficResponse = SubredditTrafficData;

export type SubredditSettingsResponse = Thing<SubredditSettingsData>;

// Friends (Deprecated)
export interface FriendsListingParams extends PaginationQueryParams {}
export interface FriendsList {
  kind: 'UserList';
  data: {
    children: FriendData[];
  };
}
export interface AddFriendPayload {
  name: string;
  note?: string | null;
}
// More Comments
export interface MoreChildrenParams {
  api_type: 'json';
  children: string;
  link_id: `t3_${string}`;
  sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'qa' | 'live';
  depth?: number;
  id?: string;
  limit_children?: boolean;
  raw_json?: 1;
}
export interface MoreChildrenResponse {
  json: {
    errors: ApiError[];
    data?: {
      things: Thing<CommentData | MoreChildrenData>[];
    };
  };
}

// User Endpoints
export interface UserPreferencesResponse extends UserPreferences {}

export interface UpdateUserPreferencesPayload extends Partial<UserPreferences> {
  api_type?: 'json';
}

// Award/Gilding
export interface GildResponse extends ApiResponse {
  json?: {
    errors?: ApiError[];
    data?: {
      thing?: Thing<CommentData | LinkData>;
    };
  };
}

// Subreddit Autocomplete
export interface SubredditAutocompleteParams {
  query: string;
  include_over_18?: boolean;
  include_profiles?: boolean;
  limit?: number;
  search_query_id?: string;
  typeahead_active?: boolean;
  raw_json?: 1;
}

export interface SubredditAutocompleteResponse {
  subreddits?: Array<{
    id: string;
    name: string;
    display_name: string;
    display_name_prefixed: string;
    icon_img?: string;
    subscribers?: number;
    over_18?: boolean;
    allow_images?: boolean;
  }>;
  profiles?: Array<{
    id: string;
    name: string;
    display_name: string;
    icon_img?: string;
  }>;
}

// Messaging
export interface MessageInboxParams extends PaginationQueryParams {
  mark?: boolean;
  mid?: string;
}

export type MessageInboxResponse = Listing<MessageData>;

export interface ReadMessageParams {
  id: string;
}

export interface UnreadMessageParams {
  id: string;
}

export interface ReadAllMessagesParams {
  filter_types?: string;
}

// Live Threads
export interface LiveThreadData {
  id: string;
  title: string;
  description?: string;
  description_html?: string;
  created_utc: number;
  nsfw: boolean;
  resources?: string;
  resources_html?: string;
  state: 'live' | 'complete' | 'archived';
  viewer_count?: number;
  viewer_count_fuzzed?: boolean;
  websocket_url?: string;
  announcement_url?: string;
  total_views?: number;
  icon?: string;
}

export interface LiveUpdateData {
  id: string;
  author: string;
  author_flair_css_class?: string | null;
  author_flair_text?: string | null;
  body: string;
  body_html?: string;
  created_utc: number;
  embeds?: unknown[];
  mobile_embeds?: unknown[];
  stricken?: boolean;
}

// Wiki
export interface WikiPageData {
  content_md: string;
  content_html?: string;
  revision_date: number;
  revision_by?: {
    id: string;
    name: string;
  };
  may_revise: boolean;
}

// Stylesheet/Configuration
export interface SubredditStylesheetResponse {
  stylesheet: string;
  images?: Array<{
    name: string;
    url: string;
    link?: string;
  }>;
}

// Account Management
export interface BlockedUsersResponse {
  kind: 'UserList';
  data: {
    children: Array<{
      name: string;
      id: `t2_${string}`;
      date: number;
    }>;
  };
}

// Captcha
export interface NeedsCaptchaResponse {
  [key: string]: boolean;
}

// Additional Comment Actions
export interface LockParams {
  id: `t1_${string}` | `t3_${string}`;
}

export interface UnlockParams {
  id: `t1_${string}` | `t3_${string}`;
}

export interface MarkNsfwParams {
  id: `t3_${string}`;
}

export interface UnmarkNsfwParams {
  id: `t3_${string}`;
}

export interface SpoilerParams {
  id: `t3_${string}`;
}

export interface UnspoilerParams {
  id: `t3_${string}`;
}

export interface SendRepliesParams {
  id: `t1_${string}` | `t3_${string}`;
  state: boolean;
}

// Contest Mode
export interface SetContestModeParams {
  api_type: 'json';
  id: `t3_${string}`;
  state: boolean;
}

// Suggested Sort
export interface SetSuggestedSortParams {
  api_type: 'json';
  id: `t3_${string}`;
  sort:
    | 'confidence'
    | 'top'
    | 'new'
    | 'controversial'
    | 'old'
    | 'qa'
    | 'live'
    | 'blank';
}

// Award Reporting
export interface ReportAwardParams {
  award_id: string;
  reason?: string;
}

// Store Visits
export interface StoreVisitsParams {
  links: string;
}

// Follow Post
export interface FollowPostParams {
  fullname: `t3_${string}`;
  follow: boolean;
}

// Collections
export interface CollectionData {
  collection_id: string;
  title: string;
  description?: string;
  author_name: string;
  author_id: `t2_${string}`;
  subreddit_id: `t5_${string}`;
  created_at_utc: number;
  last_update_utc: number;
  display_layout?: 'TIMELINE' | 'GALLERY';
  sorted_links?: Array<{
    added_at_utc: number;
    link_fullname: `t3_${string}`;
  }>;
  link_ids?: string[];
  permalink: string;
}

export type SubredditCollectionsResponse = CollectionData[];

// Emoji
export interface EmojiData {
  name: string;
  url: string;
  user_flair_allowed?: boolean;
  post_flair_allowed?: boolean;
  mod_flair_only?: boolean;
  created_by?: string;
}

// Additional Types for RedditAPI Class
export interface TokenData {
  accessToken: string;
  expires: number;
  loginURL?: string;
}

export interface ListingOptions extends PaginationQueryParams {
  g?: string;
  include_categories?: boolean;
  t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface SearchOptions extends SearchParams {}

export interface UserListingOptions extends UserActivityParams {}

export interface ListingResponseWithUrl<T> {
  kind: 'Listing';
  data: {
    before: string | null;
    after: string | null;
    children: Thing<T>[];
    dist?: number;
    geo_filter?: string | null;
    modhash?: string | null;
  };
  requestUrl: string;
}

export interface SearchResponseWithUrl {
  kind: 'Listing';
  data: {
    before: string | null;
    after: string | null;
    children: Thing<LinkData | SubredditData | AccountData>[];
    dist?: number;
    geo_filter?: string | null;
    modhash?: string | null;
  };
  requestUrl: string;
}

export interface DuplicatesOptions extends DuplicatesParams {}

export interface TokenApiResponse {
  token: string | null;
  cookieTokenParsed: TokenData | Record<string, never>;
}

export interface BearerTokenResponse {
  accessToken: string;
}

export interface TokenStorageResult {
  token: string | null | 'expired';
  cookieTokenParsed: TokenData | Record<string, never>;
}
