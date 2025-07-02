
* **API methods**[by section](/dev/api)[by oauth scope](/dev/api/oauth)
    + [account](#section_account)
        - [/api/v1/me](#GET_api_v1_me)
        - [/api/v1/me/blocked](#GET_api_v1_me_blocked)
        - [/api/v1/me/friends](#GET_api_v1_me_friends)
        - [/api/v1/me/karma](#GET_api_v1_me_karma)
        - [/api/v1/me/prefs](#GET_api_v1_me_prefs)
        - [/api/v1/me/trophies](#GET_api_v1_me_trophies)
        - [/prefs/blocked](#GET_prefs_blocked)
        - [/prefs/friends](#GET_prefs_friends)
        - [/prefs/messaging](#GET_prefs_messaging)
        - [/prefs/trusted](#GET_prefs_trusted)
        - [/prefs/*where*](#GET_prefs_{where})
    + [announcements](#section_announcements)
        - [/api/announcements/v1](#GET_api_announcements_v1)
        - [/api/announcements/v1/hide](#POST_api_announcements_v1_hide)
        - [/api/announcements/v1/read](#POST_api_announcements_v1_read)
        - [/api/announcements/v1/read\_all](#POST_api_announcements_v1_read_all)
        - [/api/announcements/v1/unread](#GET_api_announcements_v1_unread)
    + [captcha](#section_captcha)
        - [/api/needs\_captcha](#GET_api_needs_captcha)
    + [collections](#section_collections)
        - [/api/v1/collections/add\_post\_to\_collection](#POST_api_v1_collections_add_post_to_collection)
        - [/api/v1/collections/collection](#GET_api_v1_collections_collection)
        - [/api/v1/collections/create\_collection](#POST_api_v1_collections_create_collection)
        - [/api/v1/collections/delete\_collection](#POST_api_v1_collections_delete_collection)
        - [/api/v1/collections/remove\_post\_in\_collection](#POST_api_v1_collections_remove_post_in_collection)
        - [/api/v1/collections/reorder\_collection](#POST_api_v1_collections_reorder_collection)
        - [/api/v1/collections/subreddit\_collections](#GET_api_v1_collections_subreddit_collections)
        - [/api/v1/collections/update\_collection\_description](#POST_api_v1_collections_update_collection_description)
        - [/api/v1/collections/update\_collection\_display\_layout](#POST_api_v1_collections_update_collection_display_layout)
        - [/api/v1/collections/update\_collection\_title](#POST_api_v1_collections_update_collection_title)
    + [emoji](#section_emoji)
        - [/api/v1/*subreddit*/emoji.json](#POST_api_v1_{subreddit}_emoji.json)
        - [/api/v1/*subreddit*/emoji/*emoji\_name*](#DELETE_api_v1_{subreddit}_emoji_{emoji_name})
        - [/api/v1/*subreddit*/emoji\_asset\_upload\_s3.json](#POST_api_v1_{subreddit}_emoji_asset_upload_s3.json)
        - [/api/v1/*subreddit*/emoji\_custom\_size](#POST_api_v1_{subreddit}_emoji_custom_size)
        - [/api/v1/*subreddit*/emojis/all](#GET_api_v1_{subreddit}_emojis_all)
    + [flair](#section_flair)
        - [/api/clearflairtemplates](#POST_api_clearflairtemplates)
        - [/api/deleteflair](#POST_api_deleteflair)
        - [/api/deleteflairtemplate](#POST_api_deleteflairtemplate)
        - [/api/flair](#POST_api_flair)
        - [/api/flair\_template\_order](#PATCH_api_flair_template_order)
        - [/api/flairconfig](#POST_api_flairconfig)
        - [/api/flaircsv](#POST_api_flaircsv)
        - [/api/flairlist](#GET_api_flairlist)
        - [/api/flairselector](#POST_api_flairselector)
        - [/api/flairtemplate](#POST_api_flairtemplate)
        - [/api/flairtemplate\_v2](#POST_api_flairtemplate_v2)
        - [/api/link\_flair](#GET_api_link_flair)
        - [/api/link\_flair\_v2](#GET_api_link_flair_v2)
        - [/api/selectflair](#POST_api_selectflair)
        - [/api/setflairenabled](#POST_api_setflairenabled)
        - [/api/user\_flair](#GET_api_user_flair)
        - [/api/user\_flair\_v2](#GET_api_user_flair_v2)
    + [links & comments](#section_links_and_comments)
        - [/api/comment](#POST_api_comment)
        - [/api/del](#POST_api_del)
        - [/api/editusertext](#POST_api_editusertext)
        - [/api/follow\_post](#POST_api_follow_post)
        - [/api/hide](#POST_api_hide)
        - [/api/info](#GET_api_info)
        - [/api/lock](#POST_api_lock)
        - [/api/marknsfw](#POST_api_marknsfw)
        - [/api/morechildren](#GET_api_morechildren)
        - [/api/report](#POST_api_report)
        - [/api/save](#POST_api_save)
        - [/api/saved\_categories](#GET_api_saved_categories)
        - [/api/sendreplies](#POST_api_sendreplies)
        - [/api/set\_contest\_mode](#POST_api_set_contest_mode)
        - [/api/set\_subreddit\_sticky](#POST_api_set_subreddit_sticky)
        - [/api/set\_suggested\_sort](#POST_api_set_suggested_sort)
        - [/api/spoiler](#POST_api_spoiler)
        - [/api/store\_visits](#POST_api_store_visits)
        - [/api/submit](#POST_api_submit)
        - [/api/unhide](#POST_api_unhide)
        - [/api/unlock](#POST_api_unlock)
        - [/api/unmarknsfw](#POST_api_unmarknsfw)
        - [/api/unsave](#POST_api_unsave)
        - [/api/unspoiler](#POST_api_unspoiler)
        - [/api/vote](#POST_api_vote)
    + [listings](#section_listings)
        - [/best](#GET_best)
        - [/by\_id/*names*](#GET_by_id_{names})
        - [/comments/*article*](#GET_comments_{article})
        - [/controversial](#GET_controversial)
        - [/duplicates/*article*](#GET_duplicates_{article})
        - [/hot](#GET_hot)
        - [/new](#GET_new)
        - [/rising](#GET_rising)
        - [/top](#GET_top)
        - [/*sort*](#GET_{sort})
    + [live threads](#section_live)
        - [/api/live/by\_id/*names*](#GET_api_live_by_id_{names})
        - [/api/live/create](#POST_api_live_create)
        - [/api/live/happening\_now](#GET_api_live_happening_now)
        - [/api/live/*thread*/accept\_contributor\_invite](#POST_api_live_{thread}_accept_contributor_invite)
        - [/api/live/*thread*/close\_thread](#POST_api_live_{thread}_close_thread)
        - [/api/live/*thread*/delete\_update](#POST_api_live_{thread}_delete_update)
        - [/api/live/*thread*/edit](#POST_api_live_{thread}_edit)
        - [/api/live/*thread*/hide\_discussion](#POST_api_live_{thread}_hide_discussion)
        - [/api/live/*thread*/invite\_contributor](#POST_api_live_{thread}_invite_contributor)
        - [/api/live/*thread*/leave\_contributor](#POST_api_live_{thread}_leave_contributor)
        - [/api/live/*thread*/report](#POST_api_live_{thread}_report)
        - [/api/live/*thread*/rm\_contributor](#POST_api_live_{thread}_rm_contributor)
        - [/api/live/*thread*/rm\_contributor\_invite](#POST_api_live_{thread}_rm_contributor_invite)
        - [/api/live/*thread*/set\_contributor\_permissions](#POST_api_live_{thread}_set_contributor_permissions)
        - [/api/live/*thread*/strike\_update](#POST_api_live_{thread}_strike_update)
        - [/api/live/*thread*/unhide\_discussion](#POST_api_live_{thread}_unhide_discussion)
        - [/api/live/*thread*/update](#POST_api_live_{thread}_update)
        - [/live/*thread*](#GET_live_{thread})
        - [/live/*thread*/about](#GET_live_{thread}_about)
        - [/live/*thread*/contributors](#GET_live_{thread}_contributors)
        - [/live/*thread*/discussions](#GET_live_{thread}_discussions)
        - [/live/*thread*/updates/*update\_id*](#GET_live_{thread}_updates_{update_id})
    + [private messages](#section_messages)
        - [/api/block](#POST_api_block)
        - [/api/collapse\_message](#POST_api_collapse_message)
        - [/api/compose](#POST_api_compose)
        - [/api/del\_msg](#POST_api_del_msg)
        - [/api/read\_all\_messages](#POST_api_read_all_messages)
        - [/api/read\_message](#POST_api_read_message)
        - [/api/unblock\_subreddit](#POST_api_unblock_subreddit)
        - [/api/uncollapse\_message](#POST_api_uncollapse_message)
        - [/api/unread\_message](#POST_api_unread_message)
        - [/message/inbox](#GET_message_inbox)
        - [/message/sent](#GET_message_sent)
        - [/message/unread](#GET_message_unread)
        - [/message/*where*](#GET_message_{where})
    + [misc](#section_misc)
        - [/api/v1/scopes](#GET_api_v1_scopes)
    + [moderation](#section_moderation)
        - [/about/edited](#GET_about_edited)
        - [/about/log](#GET_about_log)
        - [/about/modqueue](#GET_about_modqueue)
        - [/about/reports](#GET_about_reports)
        - [/about/spam](#GET_about_spam)
        - [/about/unmoderated](#GET_about_unmoderated)
        - [/about/*location*](#GET_about_{location})
        - [/api/accept\_moderator\_invite](#POST_api_accept_moderator_invite)
        - [/api/approve](#POST_api_approve)
        - [/api/distinguish](#POST_api_distinguish)
        - [/api/ignore\_reports](#POST_api_ignore_reports)
        - [/api/leavecontributor](#POST_api_leavecontributor)
        - [/api/leavemoderator](#POST_api_leavemoderator)
        - [/api/remove](#POST_api_remove)
        - [/api/show\_comment](#POST_api_show_comment)
        - [/api/snooze\_reports](#POST_api_snooze_reports)
        - [/api/unignore\_reports](#POST_api_unignore_reports)
        - [/api/unsnooze\_reports](#POST_api_unsnooze_reports)
        - [/api/update\_crowd\_control\_level](#POST_api_update_crowd_control_level)
        - [/stylesheet](#GET_stylesheet)
    + [new modmail](#section_modmail)
        - [/api/mod/bulk\_read](#POST_api_mod_bulk_read)
        - [/api/mod/conversations](#GET_api_mod_conversations)
        - [/api/mod/conversations/:conversation\_id](#GET_api_mod_conversations_:conversation_id)
        - [/api/mod/conversations/:conversation\_id/approve](#POST_api_mod_conversations_:conversation_id_approve)
        - [/api/mod/conversations/:conversation\_id/archive](#POST_api_mod_conversations_:conversation_id_archive)
        - [/api/mod/conversations/:conversation\_id/disapprove](#POST_api_mod_conversations_:conversation_id_disapprove)
        - [/api/mod/conversations/:conversation\_id/highlight](#DELETE_api_mod_conversations_:conversation_id_highlight)
        - [/api/mod/conversations/:conversation\_id/mute](#POST_api_mod_conversations_:conversation_id_mute)
        - [/api/mod/conversations/:conversation\_id/temp\_ban](#POST_api_mod_conversations_:conversation_id_temp_ban)
        - [/api/mod/conversations/:conversation\_id/unarchive](#POST_api_mod_conversations_:conversation_id_unarchive)
        - [/api/mod/conversations/:conversation\_id/unban](#POST_api_mod_conversations_:conversation_id_unban)
        - [/api/mod/conversations/:conversation\_id/unmute](#POST_api_mod_conversations_:conversation_id_unmute)
        - [/api/mod/conversations/read](#POST_api_mod_conversations_read)
        - [/api/mod/conversations/subreddits](#GET_api_mod_conversations_subreddits)
        - [/api/mod/conversations/unread](#POST_api_mod_conversations_unread)
        - [/api/mod/conversations/unread/count](#GET_api_mod_conversations_unread_count)
    + [modnote](#section_modnote)
        - [/api/mod/notes](#DELETE_api_mod_notes)
        - [/api/mod/notes/recent](#GET_api_mod_notes_recent)
    + [multis](#section_multis)
        - [/api/filter/*filterpath*](#DELETE_api_filter_{filterpath})
        - [/api/filter/*filterpath*/r/*srname*](#DELETE_api_filter_{filterpath}_r_{srname})
        - [/api/multi/copy](#POST_api_multi_copy)
        - [/api/multi/mine](#GET_api_multi_mine)
        - [/api/multi/user/*username*](#GET_api_multi_user_{username})
        - [/api/multi/*multipath*](#DELETE_api_multi_{multipath})
        - [/api/multi/*multipath*/description](#GET_api_multi_{multipath}_description)
        - [/api/multi/*multipath*/r/*srname*](#DELETE_api_multi_{multipath}_r_{srname})
    + [search](#section_search)
        - [/search](#GET_search)
    + [subreddits](#section_subreddits)
        - [/about/banned](#GET_about_banned)
        - [/about/contributors](#GET_about_contributors)
        - [/about/moderators](#GET_about_moderators)
        - [/about/muted](#GET_about_muted)
        - [/about/wikibanned](#GET_about_wikibanned)
        - [/about/wikicontributors](#GET_about_wikicontributors)
        - [/about/*where*](#GET_about_{where})
        - [/api/delete\_sr\_banner](#POST_api_delete_sr_banner)
        - [/api/delete\_sr\_header](#POST_api_delete_sr_header)
        - [/api/delete\_sr\_icon](#POST_api_delete_sr_icon)
        - [/api/delete\_sr\_img](#POST_api_delete_sr_img)
        - [/api/recommend/sr/*srnames*](#GET_api_recommend_sr_{srnames})
        - [/api/search\_reddit\_names](#GET_api_search_reddit_names)
        - [/api/search\_subreddits](#POST_api_search_subreddits)
        - [/api/site\_admin](#POST_api_site_admin)
        - [/api/submit\_text](#GET_api_submit_text)
        - [/api/subreddit\_autocomplete](#GET_api_subreddit_autocomplete)
        - [/api/subreddit\_autocomplete\_v2](#GET_api_subreddit_autocomplete_v2)
        - [/api/subreddit\_stylesheet](#POST_api_subreddit_stylesheet)
        - [/api/subscribe](#POST_api_subscribe)
        - [/api/upload\_sr\_img](#POST_api_upload_sr_img)
        - [/api/v1/*subreddit*/post\_requirements](#GET_api_v1_{subreddit}_post_requirements)
        - [/r/*subreddit*/about](#GET_r_{subreddit}_about)
        - [/r/*subreddit*/about/edit](#GET_r_{subreddit}_about_edit)
        - [/r/*subreddit*/about/rules](#GET_r_{subreddit}_about_rules)
        - [/r/*subreddit*/about/traffic](#GET_r_{subreddit}_about_traffic)
        - [/sidebar](#GET_sidebar)
        - [/sticky](#GET_sticky)
        - [/subreddits/default](#GET_subreddits_default)
        - [/subreddits/gold](#GET_subreddits_gold)
        - [/subreddits/mine/contributor](#GET_subreddits_mine_contributor)
        - [/subreddits/mine/moderator](#GET_subreddits_mine_moderator)
        - [/subreddits/mine/streams](#GET_subreddits_mine_streams)
        - [/subreddits/mine/subscriber](#GET_subreddits_mine_subscriber)
        - [/subreddits/mine/*where*](#GET_subreddits_mine_{where})
        - [/subreddits/new](#GET_subreddits_new)
        - [/subreddits/popular](#GET_subreddits_popular)
        - [/subreddits/search](#GET_subreddits_search)
        - [/subreddits/*where*](#GET_subreddits_{where})
        - [/users/new](#GET_users_new)
        - [/users/popular](#GET_users_popular)
        - [/users/search](#GET_users_search)
        - [/users/*where*](#GET_users_{where})
    + [users](#section_users)
        - [/api/block\_user](#POST_api_block_user)
        - [/api/friend](#POST_api_friend)
        - [/api/report\_user](#POST_api_report_user)
        - [/api/setpermissions](#POST_api_setpermissions)
        - [/api/unfriend](#POST_api_unfriend)
        - [/api/user\_data\_by\_account\_ids](#GET_api_user_data_by_account_ids)
        - [/api/username\_available](#GET_api_username_available)
        - [/api/v1/me/friends/*username*](#DELETE_api_v1_me_friends_{username})
        - [/api/v1/user/*username*/trophies](#GET_api_v1_user_{username}_trophies)
        - [/user/*username*/about](#GET_user_{username}_about)
        - [/user/*username*/comments](#GET_user_{username}_comments)
        - [/user/*username*/downvoted](#GET_user_{username}_downvoted)
        - [/user/*username*/gilded](#GET_user_{username}_gilded)
        - [/user/*username*/hidden](#GET_user_{username}_hidden)
        - [/user/*username*/overview](#GET_user_{username}_overview)
        - [/user/*username*/saved](#GET_user_{username}_saved)
        - [/user/*username*/submitted](#GET_user_{username}_submitted)
        - [/user/*username*/upvoted](#GET_user_{username}_upvoted)
        - [/user/*username*/*where*](#GET_user_{username}_{where})
    + [widgets](#section_widgets)
        - [/api/widget](#POST_api_widget)
        - [/api/widget/*widget\_id*](#DELETE_api_widget_{widget_id})
        - [/api/widget\_image\_upload\_s3](#POST_api_widget_image_upload_s3)
        - [/api/widget\_order/*section*](#PATCH_api_widget_order_{section})
        - [/api/widgets](#GET_api_widgets)
    + [wiki](#section_wiki)
        - [/api/wiki/alloweditor/add](#POST_api_wiki_alloweditor_add)
        - [/api/wiki/alloweditor/del](#POST_api_wiki_alloweditor_del)
        - [/api/wiki/alloweditor/*act*](#POST_api_wiki_alloweditor_{act})
        - [/api/wiki/edit](#POST_api_wiki_edit)
        - [/api/wiki/hide](#POST_api_wiki_hide)
        - [/api/wiki/revert](#POST_api_wiki_revert)
        - [/wiki/discussions/*page*](#GET_wiki_discussions_{page})
        - [/wiki/pages](#GET_wiki_pages)
        - [/wiki/revisions](#GET_wiki_revisions)
        - [/wiki/revisions/*page*](#GET_wiki_revisions_{page})
        - [/wiki/settings/*page*](#GET_wiki_settings_{page})
        - [/wiki/*page*](#GET_wiki_{page})

This is automatically-generated documentation for the reddit API.

**Please take care to respect our [API access rules](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki).**

## overview

### listings

Many endpoints on reddit use the same protocol for controlling pagination and
filtering. These endpoints are called Listings and share five common
parameters: `after` / `before`, `limit`, `count`, and `show`.

Listings do not use page numbers because their content changes so frequently.
Instead, they allow you to view slices of the underlying data. Listing JSON
responses contain `after` and `before` fields which are equivalent to the
"next" and "prev" buttons on the site and in combination with `count` can be
used to page through the listing.

The common parameters are as follows:

* `after` / `before` - only one should be specified. these indicate the
  [fullname](#fullnames) of an item in the listing to use as the anchor point of
  the slice.
* `limit` - the maximum number of items to return in this slice of the listing.
* `count` - the number of items already seen in this listing. on the html site,
  the builder uses this to determine when to give values for `before` and `after`
  in the response.
* `show` - optional parameter; if `all` is passed, filters such as "hide links
  that I have voted on" will be disabled.

To page through a listing, start by fetching the first page without specifying
values for `after` and `count`. The response will contain an `after` value
which you can pass in the next request. It is a good idea, but not required, to
send an updated value for `count` which should be the number of items already
fetched.

### modhashes

A modhash is a token that the reddit API requires to help prevent
[CSRF](http://en.wikipedia.org/wiki/CSRF). Modhashes can be obtained via the
[/api/me.json](#GET_api_me.json) call or in response data of listing endpoints.

The preferred way to send a modhash is to include an `X-Modhash` custom HTTP
header with your requests.

Modhashes are not required when authenticated with OAuth.

### fullnames

A fullname is a combination of a thing's type (e.g. `Link`) and its unique ID
which forms a compact encoding of a globally unique ID on reddit.

Fullnames start with the type prefix for the object's type, followed by the
thing's unique ID in [base 36](http://en.wikipedia.org/wiki/Base36). For
example, `t3_15bfi0`.

type prefixes

| t1\_ | Comment |
| t2\_ | Account |
| t3\_ | Link |
| t4\_ | Message |
| t5\_ | Subreddit |
| t6\_ | Award |

### response body encoding

For legacy reasons, all JSON response bodies currently have `<`, `>`, and `&`
replaced with `&lt;`, `&gt;`, and `&amp;`, respectively. If you wish to opt out
of this behaviour, add a `raw_json=1` parameter to your request.

## account

[#](#GET_api_v1_me)

### GET /api/v1/me[identity](https://github.com/reddit/reddit/wiki/OAuth2)

Returns the identity of the user.

[#](#GET_api_v1_me_karma)

### GET /api/v1/me/karma[mysubreddits](https://github.com/reddit/reddit/wiki/OAuth2)

Return a breakdown of subreddit karma.

[#](#GET_api_v1_me_prefs)

### GET /api/v1/me/prefs[identity](https://github.com/reddit/reddit/wiki/OAuth2)

Return the preference settings of the logged in user

|  |  |
| --- | --- |
| fields | A comma-separated list of items from this set:  `beta`  `threaded_messages`  `hide_downs`  `private_feeds`  `activity_relevant_ads`  `enable_reddit_pro_analytics_emails`  `profile_opt_out`  `bad_comment_autocollapse`  `third_party_site_data_personalized_content`  `show_link_flair`  `live_bar_recommendations_enabled`  `show_trending`  `top_karma_subreddits`  `country_code`  `theme_selector`  `monitor_mentions`  `email_comment_reply`  `newwindow`  `email_new_user_welcome`  `research`  `ignore_suggested_sort`  `show_presence`  `email_upvote_comment`  `email_digests`  `whatsapp_comment_reply`  `num_comments`  `feed_recommendations_enabled`  `clickgadget`  `use_global_defaults`  `label_nsfw`  `domain_details`  `show_stylesheets`  `live_orangereds`  `highlight_controversial`  `mark_messages_read`  `no_profanity`  `email_unsubscribe_all`  `whatsapp_enabled`  `lang`  `in_redesign_beta`  `email_messages`  `third_party_data_personalized_ads`  `email_chat_request`  `allow_clicktracking`  `hide_from_robots`  `show_gold_expiration`  `show_twitter`  `compress`  `store_visits`  `video_autoplay`  `email_upvote_post`  `email_username_mention`  `media_preview`  `email_user_new_follower`  `nightmode`  `enable_default_themes`  `geopopular`  `third_party_site_data_personalized_ads`  `survey_last_seen_time`  `threaded_modmail`  `enable_followers`  `hide_ups`  `min_comment_score`  `public_votes`  `show_location_based_recommendations`  `email_post_reply`  `collapse_read_messages`  `show_flair`  `send_crosspost_messages`  `search_include_over_18`  `hide_ads`  `third_party_personalized_ads`  `min_link_score`  `over_18`  `sms_notifications_enabled`  `numsites`  `media`  `legacy_search`  `email_private_message`  `send_welcome_messages`  `email_community_discovery`  `highlight_new_comments`  `default_comment_sort`  `accept_pms` |

[#](#PATCH_api_v1_me_prefs)

### PATCH /api/v1/me/prefs[account](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| This endpoint expects JSON data of this format | ``` {   "accept_pms": one of (`everyone`, `whitelisted`),   "activity_relevant_ads": boolean value,   "allow_clicktracking": boolean value,   "bad_comment_autocollapse": one of (`off`, `low`, `medium`, `high`),   "beta": boolean value,   "clickgadget": boolean value,   "collapse_read_messages": boolean value,   "compress": boolean value,   "country_code": one of (`WF`, `JP`, `JM`, `JO`, `WS`, `JE`, `GW`, `GU`, `GT`, `GS`, `GR`, `GQ`, `GP`, `GY`, `GG`, `GF`, `GE`, `GD`, `GB`, `GA`, `GN`, `GM`, `GL`, `GI`, `GH`, `PR`, `PS`, `PW`, `PT`, `PY`, `PA`, `PF`, `PG`, `PE`, `PK`, `PH`, `PN`, `PL`, `PM`, `ZM`, `ZA`, `ZZ`, `ZW`, `ME`, `MD`, `MG`, `MF`, `MA`, `MC`, `MM`, `ML`, `MO`, `MN`, `MH`, `MK`, `MU`, `MT`, `MW`, `MV`, `MQ`, `MP`, `MS`, `MR`, `MY`, `MX`, `MZ`, `FR`, `FI`, `FJ`, `FK`, `FM`, `FO`, `CK`, `CI`, `CH`, `CO`, `CN`, `CM`, `CL`, `CC`, `CA`, `CG`, `CF`, `CD`, `CZ`, `CY`, `CX`, `CR`, `CW`, `CV`, `CU`, `SZ`, `SY`, `SX`, `SS`, `SR`, `SV`, `ST`, `SK`, `SJ`, `SI`, `SH`, `SO`, `SN`, `SM`, `SL`, `SC`, `SB`, `SA`, `SG`, `SE`, `SD`, `YE`, `YT`, `LB`, `LC`, `LA`, `LK`, `LI`, `LV`, `LT`, `LU`, `LR`, `LS`, `LY`, `VA`, `VC`, `VE`, `VG`, `IQ`, `VI`, `IS`, `IR`, `IT`, `VN`, `IM`, `IL`, `IO`, `IN`, `IE`, `ID`, `BD`, `BE`, `BF`, `BG`, `BA`, `BB`, `BL`, `BM`, `BN`, `BO`, `BH`, `BI`, `BJ`, `BT`, `BV`, `BW`, `BQ`, `BR`, `BS`, `BY`, `BZ`, `RU`, `RW`, `RS`, `RE`, `RO`, `OM`, `HR`, `HT`, `HU`, `HK`, `HN`, `HM`, `EH`, `EE`, `EG`, `EC`, `ET`, `ES`, `ER`, `UY`, `UZ`, `US`, `UM`, `UG`, `UA`, `VU`, `NI`, `NL`, `NO`, `NA`, `NC`, `NE`, `NF`, `NG`, `NZ`, `NP`, `NR`, `NU`, `XK`, `XZ`, `XX`, `KG`, `KE`, `KI`, `KH`, `KN`, `KM`, `KR`, `KP`, `KW`, `KZ`, `KY`, `DO`, `DM`, `DJ`, `DK`, `DE`, `DZ`, `TZ`, `TV`, `TW`, `TT`, `TR`, `TN`, `TO`, `TL`, `TM`, `TJ`, `TK`, `TH`, `TF`, `TG`, `TD`, `TC`, `AE`, `AD`, `AG`, `AF`, `AI`, `AM`, `AL`, `AO`, `AN`, `AQ`, `AS`, `AR`, `AU`, `AT`, `AW`, `AX`, `AZ`, `QA`),   "default_comment_sort": one of (`confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`),   "domain_details": boolean value,   "email_chat_request": boolean value,   "email_comment_reply": boolean value,   "email_community_discovery": boolean value,   "email_digests": boolean value,   "email_messages": boolean value,   "email_new_user_welcome": boolean value,   "email_post_reply": boolean value,   "email_private_message": boolean value,   "email_unsubscribe_all": boolean value,   "email_upvote_comment": boolean value,   "email_upvote_post": boolean value,   "email_user_new_follower": boolean value,   "email_username_mention": boolean value,   "enable_default_themes": boolean value,   "enable_followers": boolean value,   "enable_reddit_pro_analytics_emails": boolean value,   "feed_recommendations_enabled": boolean value,   "g": one of (`GLOBAL`, `US`, `AR`, `AU`, `BG`, `CA`, `CL`, `CO`, `HR`, `CZ`, `FI`, `FR`, `DE`, `GR`, `HU`, `IS`, `IN`, `IE`, `IT`, `JP`, `MY`, `MX`, `NZ`, `PH`, `PL`, `PT`, `PR`, `RO`, `RS`, `SG`, `ES`, `SE`, `TW`, `TH`, `TR`, `GB`, `US_WA`, `US_DE`, `US_DC`, `US_WI`, `US_WV`, `US_HI`, `US_FL`, `US_WY`, `US_NH`, `US_NJ`, `US_NM`, `US_TX`, `US_LA`, `US_NC`, `US_ND`, `US_NE`, `US_TN`, `US_NY`, `US_PA`, `US_CA`, `US_NV`, `US_VA`, `US_CO`, `US_AK`, `US_AL`, `US_AR`, `US_VT`, `US_IL`, `US_GA`, `US_IN`, `US_IA`, `US_OK`, `US_AZ`, `US_ID`, `US_CT`, `US_ME`, `US_MD`, `US_MA`, `US_OH`, `US_UT`, `US_MO`, `US_MN`, `US_MI`, `US_RI`, `US_KS`, `US_MT`, `US_MS`, `US_SC`, `US_KY`, `US_OR`, `US_SD`),   "hide_ads": boolean value,   "hide_downs": boolean value,   "hide_from_robots": boolean value,   "hide_ups": boolean value,   "highlight_controversial": boolean value,   "highlight_new_comments": boolean value,   "ignore_suggested_sort": boolean value,   "in_redesign_beta": boolean value,   "label_nsfw": boolean value,   "lang": a valid IETF language tag (underscore separated),   "legacy_search": boolean value,   "live_bar_recommendations_enabled": boolean value,   "live_orangereds": boolean value,   "mark_messages_read": boolean value,   "media": one of (`on`, `off`, `subreddit`),   "media_preview": one of (`on`, `off`, `subreddit`),   "min_comment_score": an integer between -100 and 100,   "min_link_score": an integer between -100 and 100,   "monitor_mentions": boolean value,   "newwindow": boolean value,   "nightmode": boolean value,   "no_profanity": boolean value,   "num_comments": an integer between 1 and 500,   "numsites": an integer between 1 and 100,   "over_18": boolean value,   "private_feeds": boolean value,   "profile_opt_out": boolean value,   "public_votes": boolean value,   "research": boolean value,   "search_include_over_18": boolean value,   "send_crosspost_messages": boolean value,   "send_welcome_messages": boolean value,   "show_flair": boolean value,   "show_gold_expiration": boolean value,   "show_link_flair": boolean value,   "show_location_based_recommendations": boolean value,   "show_presence": boolean value,   "show_stylesheets": boolean value,   "show_trending": boolean value,   "show_twitter": boolean value,   "sms_notifications_enabled": boolean value,   "store_visits": boolean value,   "survey_last_seen_time": an integer,   "theme_selector": subreddit name,   "third_party_data_personalized_ads": boolean value,   "third_party_personalized_ads": boolean value,   "third_party_site_data_personalized_ads": boolean value,   "third_party_site_data_personalized_content": boolean value,   "threaded_messages": boolean value,   "threaded_modmail": boolean value,   "top_karma_subreddits": boolean value,   "use_global_defaults": boolean value,   "video_autoplay": boolean value,   "whatsapp_comment_reply": boolean value,   "whatsapp_enabled": boolean value, }  ``` |

[#](#GET_api_v1_me_trophies)

### GET /api/v1/me/trophies[identity](https://github.com/reddit/reddit/wiki/OAuth2)

Return a list of trophies for the current user.

[#](#GET_prefs_{where})

### GET /prefs/*where*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /prefs/friends
* → /prefs/blocked
* → /prefs/messaging
* → /prefs/trusted
* → /api/v1/me/friends
* → /api/v1/me/blocked

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

## announcements

[#](#GET_api_announcements_v1)

### GET /api/announcements/v1[announcements](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/announcements/v1/unread

Fetch announcements from Reddit.

|  |  |
| --- | --- |
| after | (beta) fullname of an announcement, prefixed `ann_` |
| before | (beta) fullname of an announcement, prefixed `ann_` |
| limit | an integer between 1 and 100 |

[#](#POST_api_announcements_v1_hide)

### POST /api/announcements/v1/hide[announcements](https://github.com/reddit/reddit/wiki/OAuth2)

Accepts a list of announcement fullnames (`ann_`)
and marks them hidden if they belong to the authenticated user

|  |  |
| --- | --- |
| ids | (beta) comma separated list of announcement fullnames, prefixed `ann_` |

[#](#POST_api_announcements_v1_read)

### POST /api/announcements/v1/read[announcements](https://github.com/reddit/reddit/wiki/OAuth2)

Accepts a list of announcement fullnames (`ann_`)
and marks them read if they belong to the authenticated user

|  |  |
| --- | --- |
| ids | (beta) comma separated list of announcement fullnames, prefixed `ann_` |

[#](#POST_api_announcements_v1_read_all)

### POST /api/announcements/v1/read\_all[announcements](https://github.com/reddit/reddit/wiki/OAuth2)

Marks all unread announcements as read for the authenticated user

## captcha

[#](#GET_api_needs_captcha)

### GET /api/needs\_captcha[any](https://github.com/reddit/reddit/wiki/OAuth2)

Check whether ReCAPTCHAs are needed for API methods

## collections

[#](#POST_api_v1_collections_add_post_to_collection)

### POST /api/v1/collections/add\_post\_to\_collection[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Add a post to a collection

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| link\_fullname | a fullname of a link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_v1_collections_collection)

### GET /api/v1/collections/collection[read](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch a collection including all the links

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| include\_links | boolean value |

[#](#POST_api_v1_collections_create_collection)

### POST /api/v1/collections/create\_collection[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Create a collection

|  |  |
| --- | --- |
| description | a string no longer than 500 characters |
| display\_layout | one of (`TIMELINE`, `GALLERY`) |
| sr\_fullname | a fullname of a subreddit |
| title | title of the submission. up to 300 characters long |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_v1_collections_delete_collection)

### POST /api/v1/collections/delete\_collection[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Delete a collection

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_v1_collections_remove_post_in_collection)

### POST /api/v1/collections/remove\_post\_in\_collection[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Remove a post from a collection

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| link\_fullname | a fullname of a link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_v1_collections_reorder_collection)

### POST /api/v1/collections/reorder\_collection[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Reorder posts in a collection

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| link\_ids | the list of comma seperated link\_ids in the order to set them in |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_v1_collections_subreddit_collections)

### GET /api/v1/collections/subreddit\_collections[read](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch collections for the subreddit

|  |  |
| --- | --- |
| sr\_fullname | a fullname of a subreddit |

[#](#POST_api_v1_collections_update_collection_description)

### POST /api/v1/collections/update\_collection\_description[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Update a collection's description

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| description | a string no longer than 500 characters |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_v1_collections_update_collection_display_layout)

### POST /api/v1/collections/update\_collection\_display\_layout[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Update a collection's display layout

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| display\_layout | one of (`TIMELINE`, `GALLERY`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_v1_collections_update_collection_title)

### POST /api/v1/collections/update\_collection\_title[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Update a collection's title

|  |  |
| --- | --- |
| collection\_id | the UUID of a collection |
| title | title of the submission. up to 300 characters long |
| uh / X-Modhash header | a [modhash](#modhashes) |

## emoji

[#](#POST_api_v1_{subreddit}_emoji.json)

### POST /api/v1/*subreddit*/emoji.json[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Add an emoji to the DB by posting a message on emoji\_upload\_q.
A job processor that listens on a queue, uses the s3\_key provided
in the request to locate the image in S3 Temp Bucket and moves it
to the PERM bucket. It also adds it to the DB using name as the column
and sr\_fullname as the key and sends the status on the websocket URL
that is provided as part of this response.

This endpoint should also be used to update custom subreddit emojis
with new images. If only the permissions on an emoji require updating
the POST\_emoji\_permissions endpoint should be requested, instead.

|  |  |
| --- | --- |
| mod\_flair\_only | boolean value |
| name | Name of the emoji to be created. It can be alphanumeric without any special characters except '-' & '\_' and cannot exceed 24 characters. |
| post\_flair\_allowed | boolean value |
| s3\_key | S3 key of the uploaded image which can be obtained from the S3 url. This is of the form subreddit/hash\_value. |
| user\_flair\_allowed | boolean value |

[#](#DELETE_api_v1_{subreddit}_emoji_{emoji_name})

### DELETE /api/v1/*subreddit*/emoji/*emoji\_name*[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Delete a Subreddit emoji.
Remove the emoji from Cassandra and purge the assets from S3
and the image resizing provider.

[#](#POST_api_v1_{subreddit}_emoji_asset_upload_s3.json)

### POST /api/v1/*subreddit*/emoji\_asset\_upload\_s3.json[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Acquire and return an upload lease to s3 temp bucket. The return value
of this function is a json object containing credentials for uploading
assets to S3 bucket, S3 url for upload request and the key to use for
uploading. Using this lease the client will upload the emoji image to
S3 temp bucket (included as part of the S3 URL).

This lease is used by S3 to verify that the upload is authorized.

|  |  |
| --- | --- |
| filepath | name and extension of the image file e.g. image1.png |
| mimetype | mime type of the image e.g. image/png |

[#](#POST_api_v1_{subreddit}_emoji_custom_size)

### POST /api/v1/*subreddit*/emoji\_custom\_size[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Set custom emoji size.

Omitting width or height will disable custom emoji sizing.

|  |  |
| --- | --- |
| height | an integer between 1 and 40 (default: 0) |
| width | an integer between 1 and 40 (default: 0) |

[#](#GET_api_v1_{subreddit}_emojis_all)

### GET /api/v1/*subreddit*/emojis/all[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get all emojis for a SR. The response includes snoomojis
as well as emojis for the SR specified in the request.

The response has 2 keys:
- snoomojis
- SR emojis

## flair

[#](#POST_api_clearflairtemplates)

### POST [/r/*subreddit*]/api/clearflairtemplates[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| flair\_type | one of (`USER_FLAIR`, `LINK_FLAIR`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_deleteflair)

### POST [/r/*subreddit*]/api/deleteflair[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| name | a user by name |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_deleteflairtemplate)

### POST [/r/*subreddit*]/api/deleteflairtemplate[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| flair\_template\_id |  |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_flair)

### POST [/r/*subreddit*]/api/flair[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| css\_class | a valid subreddit image name |
| link | a [fullname](#fullname) of a link |
| name | a user by name |
| text | a string no longer than 64 characters |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#PATCH_api_flair_template_order)

### PATCH [/r/*subreddit*]/api/flair\_template\_order[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

Update the order of flair templates in the specified subreddit.

Order should contain every single flair id for that flair type; omitting
any id will result in a loss of data.

|  |  |
| --- | --- |
| flair\_type | one of (`USER_FLAIR`, `LINK_FLAIR`) |
| subreddit | subreddit name |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_flairconfig)

### POST [/r/*subreddit*]/api/flairconfig[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| flair\_enabled | boolean value |
| flair\_position | one of (`left`, `right`) |
| flair\_self\_assign\_enabled | boolean value |
| link\_flair\_position | one of (``,`left`,`right`) |
| link\_flair\_self\_assign\_enabled | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_flaircsv)

### POST [/r/*subreddit*]/api/flaircsv[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

Change the flair of multiple users in the same subreddit with a
single API call.

Requires a string 'flair\_csv' which has up to 100 lines of the form
'`user`,`flairtext`,`cssclass`' (Lines beyond the 100th are ignored).

If both `cssclass` and `flairtext` are the empty string for a given
`user`, instead clears that user's flair.

Returns an array of objects indicating if each flair setting was
applied, or a reason for the failure.

|  |  |
| --- | --- |
| flair\_csv | comma-seperated flair information |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_flairlist)

### GET [/r/*subreddit*]/api/flairlist[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 1000) |
| name | a user by name |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#POST_api_flairselector)

### POST [/r/*subreddit*]/api/flairselector[flair](https://github.com/reddit/reddit/wiki/OAuth2)

Return information about a users's flair options.

If `link` is given, return link flair options for an existing link.
If `is_newlink` is True, return link flairs options for a new link submission.
Otherwise, return user flair options for this subreddit.

The logged in user's flair is also returned.
Subreddit moderators may give a user by `name` to instead
retrieve that user's flair.

|  |  |
| --- | --- |
| is\_newlink | boolean value |
| link | a [fullname](#fullname) of a link |
| name | a user by name |

[#](#POST_api_flairtemplate)

### POST [/r/*subreddit*]/api/flairtemplate[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| css\_class | a valid subreddit image name |
| flair\_template\_id |  |
| flair\_type | one of (`USER_FLAIR`, `LINK_FLAIR`) |
| text | a string no longer than 64 characters |
| text\_editable | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_flairtemplate_v2)

### POST [/r/*subreddit*]/api/flairtemplate\_v2[modflair](https://github.com/reddit/reddit/wiki/OAuth2)

Create or update a flair template.

This new endpoint is primarily used for the redesign.

|  |  |
| --- | --- |
| allowable\_content | one of (`all`, `emoji`, `text`) |
| api\_type | the string `json` |
| background\_color | a 6-digit rgb hex color, e.g. `#AABBCC` |
| css\_class | a valid subreddit image name |
| flair\_template\_id |  |
| flair\_type | one of (`USER_FLAIR`, `LINK_FLAIR`) |
| max\_emojis | an integer between 1 and 10 (default: 10) |
| mod\_only | boolean value |
| override\_css |  |
| text | a string no longer than 64 characters |
| text\_color | one of (`light`, `dark`) |
| text\_editable | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_link_flair)

### GET [/r/*subreddit*]/api/link\_flair[flair](https://github.com/reddit/reddit/wiki/OAuth2)

Return list of available link flair for the current subreddit.

Will not return flair if the user cannot set their own link flair and
they are not a moderator that can set flair.

[#](#GET_api_link_flair_v2)

### GET [/r/*subreddit*]/api/link\_flair\_v2[flair](https://github.com/reddit/reddit/wiki/OAuth2)

Return list of available link flair for the current subreddit.

Will not return flair if the user cannot set their own link flair and
they are not a moderator that can set flair.

[#](#POST_api_selectflair)

### POST [/r/*subreddit*]/api/selectflair[flair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| background\_color | a 6-digit rgb hex color, e.g. `#AABBCC` |
| css\_class | a valid subreddit image name |
| flair\_template\_id |  |
| link | a [fullname](#fullname) of a link |
| name | a user by name |
| return\_rtson | [all|only|none]: "all" saves attributes and returns rtjson "only" only returns rtjson"none" only saves attributes |
| text | a string no longer than 64 characters |
| text\_color | one of (`light`, `dark`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_setflairenabled)

### POST [/r/*subreddit*]/api/setflairenabled[flair](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| flair\_enabled | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_user_flair)

### GET [/r/*subreddit*]/api/user\_flair[flair](https://github.com/reddit/reddit/wiki/OAuth2)

Return list of available user flair for the current subreddit.

Will not return flair if flair is disabled on the subreddit,
the user cannot set their own flair, or they are not a moderator
that can set flair.

[#](#GET_api_user_flair_v2)

### GET [/r/*subreddit*]/api/user\_flair\_v2[flair](https://github.com/reddit/reddit/wiki/OAuth2)

Return list of available user flair for the current subreddit.

If user is not a mod of the subreddit, this endpoint filters
out mod\_only templates.

## links & comments

[#](#POST_api_comment)

### POST /api/comment[any](https://github.com/reddit/reddit/wiki/OAuth2)

Submit a new comment or reply to a message.

`parent` is the fullname of the thing being replied to. Its value
changes the kind of object created by this request:

* the fullname of a Link: a top-level comment in that Link's thread. (requires `submit` scope)
* the fullname of a Comment: a comment reply to that comment. (requires `submit` scope)
* the fullname of a Message: a message reply to that message. (requires `privatemessages` scope)

`text` should be the raw markdown body of the comment or message.

To start a new message thread, use [/api/compose](#POST_api_compose).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| recaptcha\_token | a string |
| return\_rtjson | boolean value |
| richtext\_json | JSON data |
| text | raw markdown text |
| thing\_id | [fullname](#fullnames) of parent thing |
| uh / X-Modhash header | a [modhash](#modhashes) |
| video\_poster\_url | a string |

[#](#POST_api_del)

### POST /api/del[edit](https://github.com/reddit/reddit/wiki/OAuth2)

Delete a Link or Comment.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing created by the user |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_editusertext)

### POST /api/editusertext[edit](https://github.com/reddit/reddit/wiki/OAuth2)

Edit the body text of a comment or self-post.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| return\_rtjson | boolean value |
| richtext\_json | JSON data |
| text | raw markdown text |
| thing\_id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |
| video\_poster\_url | a string |

[#](#POST_api_follow_post)

### POST /api/follow\_post[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

Follow or unfollow a post.

To follow, `follow` should be True. To unfollow, `follow` should
be False. The user must have access to the subreddit to be able to
follow a post within it.

|  |  |
| --- | --- |
| follow | boolean: True to follow or False to unfollow |
| fullname | [fullname](#fullnames) of a link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_hide)

### POST /api/hide[report](https://github.com/reddit/reddit/wiki/OAuth2)

Hide a link.

This removes it from the user's default view of subreddit listings.

See also: [/api/unhide](#POST_api_unhide).

|  |  |
| --- | --- |
| id | A comma-separated list of link [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_info)

### GET [/r/*subreddit*]/api/info[read](https://github.com/reddit/reddit/wiki/OAuth2)

Return a listing of things specified by their fullnames.

Only Links, Comments, and Subreddits are allowed.

|  |  |
| --- | --- |
| id | A comma-separated list of thing [fullnames](#fullnames) |
| sr\_name | comma-delimited list of subreddit names |
| url | a valid URL |

[#](#POST_api_lock)

### POST /api/lock[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Lock a link or comment.

Prevents a post or new child comments from receiving new comments.

See also: [/api/unlock](#POST_api_unlock).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_marknsfw)

### POST /api/marknsfw[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Mark a link NSFW.

See also: [/api/unmarknsfw](#POST_api_unmarknsfw).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_morechildren)

### GET /api/morechildren[read](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve additional comments omitted from a base comment tree.

When a comment tree is rendered, the most relevant comments are
selected for display first. Remaining comments are stubbed out with
"MoreComments" links. This API call is used to retrieve the additional
comments represented by those stubs, up to 100 at a time.

The two core parameters required are `link` and `children`. `link` is
the fullname of the link whose comments are being fetched. `children`
is a comma-delimited list of comment ID36s that need to be fetched.

If `id` is passed, it should be the ID of the MoreComments object this
call is replacing. This is needed only for the HTML UI's purposes and
is optional otherwise.

**NOTE:** you may only make one request at a time to this API endpoint.
Higher concurrency will result in an error being returned.

If `limit_children` is True, only return the children requested.

`depth` is the maximum depth of subtrees in the thread.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| children |  |
| depth | (optional) an integer |
| id | (optional) id of the associated MoreChildren object |
| limit\_children | boolean value |
| link\_id | [fullname](#fullnames) of a link |
| sort | one of (`confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`) |

[#](#POST_api_report)

### POST /api/report[report](https://github.com/reddit/reddit/wiki/OAuth2)

Report a link, comment or message.
Reporting a thing brings it to the attention of the subreddit's
moderators. Reporting a message sends it to a system for admin review.
For links and comments, the thing is implicitly hidden as well (see
[/api/hide](#POST_api_hide) for details).

See [/r/{subreddit}/about/rules](#GET_r_%7Bsubreddit%7D_about_rules) for
for more about subreddit rules, and [/r/{subreddit}/about](#GET_r_%7Bsubreddit%7D_about)
for more about `free_form_reports`.

|  |  |
| --- | --- |
| additional\_info | a string no longer than 2000 characters |
| api\_type | the string `json` |
| custom\_text | a string no longer than 2000 characters |
| from\_help\_desk | boolean value |
| from\_modmail | boolean value |
| modmail\_conv\_id | base36 modmail conversation id |
| other\_reason | a string no longer than 100 characters |
| reason | a string no longer than 100 characters |
| rule\_reason | a string no longer than 100 characters |
| site\_reason | a string no longer than 100 characters |
| sr\_name | a string no longer than 1000 characters |
| thing\_id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |
| usernames | A comma-separated list of items |

[#](#POST_api_save)

### POST /api/save[save](https://github.com/reddit/reddit/wiki/OAuth2)

Save a link or comment.

Saved things are kept in the user's saved listing for later perusal.

See also: [/api/unsave](#POST_api_unsave).

|  |  |
| --- | --- |
| category | a category name |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_saved_categories)

### GET /api/saved\_categories[save](https://github.com/reddit/reddit/wiki/OAuth2)

Get a list of categories in which things are currently saved.

See also: [/api/save](#POST_api_save).

[#](#POST_api_sendreplies)

### POST /api/sendreplies[edit](https://github.com/reddit/reddit/wiki/OAuth2)

Enable or disable inbox replies for a link or comment.

`state` is a boolean that indicates whether you are enabling or
disabling inbox replies - true to enable, false to disable.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing created by the user |
| state | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_set_contest_mode)

### POST /api/set\_contest\_mode[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Set or unset "contest mode" for a link's comments.

`state` is a boolean that indicates whether you are enabling or
disabling contest mode - true to enable, false to disable.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id |  |
| state | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_set_subreddit_sticky)

### POST /api/set\_subreddit\_sticky[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Set or unset a Link as the sticky in its subreddit.

`state` is a boolean that indicates whether to sticky or unsticky
this post - true to sticky, false to unsticky.

The `num` argument is optional, and only used when stickying a post.
It allows specifying a particular "slot" to sticky the post into, and
if there is already a post stickied in that slot it will be replaced.
If there is no post in the specified slot to replace, or `num` is None,
the bottom-most slot will be used.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id |  |
| num | an integer between 1 and 4 |
| state | boolean value |
| to\_profile | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_set_suggested_sort)

### POST /api/set\_suggested\_sort[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Set a suggested sort for a link.

Suggested sorts are useful to display comments in a certain preferred way
for posts. For example, casual conversation may be better sorted by new
by default, or AMAs may be sorted by Q&A. A sort of an empty string
clears the default sort.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id |  |
| sort | one of (`confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`, `blank`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_spoiler)

### POST /api/spoiler[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_store_visits)

### POST /api/store\_visits[save](https://github.com/reddit/reddit/wiki/OAuth2)

*Requires a subscription to [reddit premium](https://www.reddit.com/premium)*

|  |  |
| --- | --- |
| links | A comma-separated list of link [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_submit)

### POST /api/submit[submit](https://github.com/reddit/reddit/wiki/OAuth2)

Submit a link to a subreddit.

Submit will create a link or self-post in the subreddit `sr` with the
title `title`. If `kind` is `"link"`, then `url` is expected to be a
valid URL to link to. Otherwise, `text`, if present, will be the
body of the self-post unless `richtext_json` is present, in which case
it will be converted into the body of the self-post. An error is thrown
if both `text` and `richtext_json` are present.

`extension` is used for determining which view-type (e.g. `json`,
`compact` etc.) to use for the redirect that is generated after submit.

|  |  |
| --- | --- |
| ad | boolean value |
| api\_type | the string `json` |
| app |  |
| collection\_id | (beta) the UUID of a collection |
| extension | extension used for redirects |
| flair\_id | a string no longer than 36 characters |
| flair\_text | a string no longer than 64 characters |
| g-recaptcha-response |  |
| kind | one of (`link`, `self`, `image`, `video`, `videogif`) |
| nsfw | boolean value |
| post\_set\_default\_post\_id | a string |
| post\_set\_id | a string |
| recaptcha\_token | a string |
| resubmit | boolean value |
| richtext\_json | JSON data |
| sendreplies | boolean value |
| spoiler | boolean value |
| sr | subreddit name |
| text | raw markdown text |
| title | title of the submission. up to 300 characters long |
| uh / X-Modhash header | a [modhash](#modhashes) |
| url | a valid URL |
| video\_poster\_url | a valid URL |

[#](#POST_api_unhide)

### POST /api/unhide[report](https://github.com/reddit/reddit/wiki/OAuth2)

Unhide a link.

See also: [/api/hide](#POST_api_hide).

|  |  |
| --- | --- |
| id | A comma-separated list of link [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unlock)

### POST /api/unlock[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Unlock a link or comment.

Allow a post or comment to receive new comments.

See also: [/api/lock](#POST_api_lock).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unmarknsfw)

### POST /api/unmarknsfw[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Remove the NSFW marking from a link.

See also: [/api/marknsfw](#POST_api_marknsfw).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unsave)

### POST /api/unsave[save](https://github.com/reddit/reddit/wiki/OAuth2)

Unsave a link or comment.

This removes the thing from the user's saved listings as well.

See also: [/api/save](#POST_api_save).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unspoiler)

### POST /api/unspoiler[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_vote)

### POST /api/vote[vote](https://github.com/reddit/reddit/wiki/OAuth2)

Cast a vote on a thing.

`id` should be the fullname of the Link or Comment to vote on.

`dir` indicates the direction of the vote. Voting `1` is an upvote,
`-1` is a downvote, and `0` is equivalent to "un-voting" by clicking
again on a highlighted arrow.

**Note: votes must be cast by humans.** That is, API clients proxying a
human's action one-for-one are OK, but bots deciding how to vote on
content or amplifying a human's vote are not. See [the reddit
rules](/rules) for more details on what constitutes vote cheating.

|  |  |
| --- | --- |
| dir | vote direction. one of (1, 0, -1) |
| id | [fullname](#fullnames) of a thing |
| rank | an integer greater than 1 |
| uh / X-Modhash header | a [modhash](#modhashes) |

## listings

[#](#GET_best)

### GET /best[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_by_id_{names})

### GET /by\_id/*names*[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get a listing of links by fullname.

`names` is a list of fullnames for links separated by commas or spaces.

|  |  |
| --- | --- |
| names | A comma-separated list of link [fullnames](#fullnames) |

[#](#GET_comments_{article})

### GET [/r/*subreddit*]/comments/*article*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Get the comment tree for a given Link `article`.

If supplied, `comment` is the ID36 of a comment in the comment tree for
`article`. This comment will be the (highlighted) focal point of the
returned view and `context` will be the number of parents shown.

`depth` is the maximum depth of subtrees in the thread.

`limit` is the maximum number of comments to return.

See also: [/api/morechildren](#GET_api_morechildren) and
[/api/comment](#POST_api_comment).

|  |  |
| --- | --- |
| article | ID36 of a link |
| comment | (optional) ID36 of a comment |
| context | an integer between 0 and 8 |
| depth | (optional) an integer |
| limit | (optional) an integer |
| showedits | boolean value |
| showmedia | boolean value |
| showmore | boolean value |
| showtitle | boolean value |
| sort | one of (`confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`) |
| sr\_detail | (optional) expand subreddits |
| theme | one of (`default`, `dark`) |
| threaded | boolean value |
| truncate | an integer between 0 and 50 |

[#](#GET_duplicates_{article})

### GET /duplicates/*article*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Return a list of other submissions of the same URL

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| article | The base 36 ID of a Link |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| crossposts\_only | boolean value |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sort | one of (`num_comments`, `new`) |
| sr | subreddit name |
| sr\_detail | (optional) expand subreddits |

[#](#GET_hot)

### GET [/r/*subreddit*]/hot[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| g | one of (`GLOBAL`, `US`, `AR`, `AU`, `BG`, `CA`, `CL`, `CO`, `HR`, `CZ`, `FI`, `FR`, `DE`, `GR`, `HU`, `IS`, `IN`, `IE`, `IT`, `JP`, `MY`, `MX`, `NZ`, `PH`, `PL`, `PT`, `PR`, `RO`, `RS`, `SG`, `ES`, `SE`, `TW`, `TH`, `TR`, `GB`, `US_WA`, `US_DE`, `US_DC`, `US_WI`, `US_WV`, `US_HI`, `US_FL`, `US_WY`, `US_NH`, `US_NJ`, `US_NM`, `US_TX`, `US_LA`, `US_NC`, `US_ND`, `US_NE`, `US_TN`, `US_NY`, `US_PA`, `US_CA`, `US_NV`, `US_VA`, `US_CO`, `US_AK`, `US_AL`, `US_AR`, `US_VT`, `US_IL`, `US_GA`, `US_IN`, `US_IA`, `US_OK`, `US_AZ`, `US_ID`, `US_CT`, `US_ME`, `US_MD`, `US_MA`, `US_OH`, `US_UT`, `US_MO`, `US_MN`, `US_MI`, `US_RI`, `US_KS`, `US_MT`, `US_MS`, `US_SC`, `US_KY`, `US_OR`, `US_SD`) |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_new)

### GET [/r/*subreddit*]/new[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_rising)

### GET [/r/*subreddit*]/rising[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_{sort})

### GET [/r/*subreddit*]/*sort*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → [/r/*subreddit*]/top
* → [/r/*subreddit*]/controversial

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| t | one of (`hour`, `day`, `week`, `month`, `year`, `all`) |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

## live threads

Real-time updates on reddit.

In addition to the standard reddit API, WebSockets play a huge role in reddit
live. Receiving push notification of changes to the thread via websockets is
much better than polling the thread repeatedly.

To connect to the websocket server, fetch
[/live/*thread*/about.json](#GET_live_%7Bthread%7D_about.json) and get the
`websocket_url` field. The websocket URL expires after a period of time; if it
does, fetch a new one from that endpoint.

Once connected to the socket, a variety of messages can come in. All messages
will be in text frames containing a JSON object with two keys: `type` and
`payload`. Live threads can send messages with many `type`s:

* `update` - a new update has been posted in the thread. the `payload` contains
  the JSON representation of the update.
* `activity` - periodic update of the viewer counts for the thread.
* `settings` - the thread's settings have changed. the `payload` is an object
  with each key being a property of the thread (as in `about.json`) and its new
  value.
* `delete` - an update has been deleted (removed from the thread).
  the `payload` is the ID of the deleted update.
* `strike` - an update has been stricken (marked incorrect and crossed out).
  the `payload` is the ID of the stricken update.
* `embeds_ready` - a previously posted update has been parsed and embedded
  media is available for it now. the `payload` contains a `liveupdate_id` and
  list of `embeds` to add to it.
* `complete` - the thread has been marked complete. no further updates will
  be sent.

See </r/live> for more information.

[#](#GET_api_live_by_id_{names})

### GET /api/live/by\_id/*names*[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get a listing of live events by id.

|  |  |
| --- | --- |
| names | a comma-delimited list of live thread fullnames or IDs |

[#](#POST_api_live_create)

### POST /api/live/create[submit](https://github.com/reddit/reddit/wiki/OAuth2)

Create a new live thread.

Once created, the initial settings can be modified with
[/api/live/*thread*/edit](#POST_api_live_%7Bthread%7D_edit) and new updates
can be posted with
[/api/live/*thread*/update](#POST_api_live_%7Bthread%7D_update).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| description | raw markdown text |
| nsfw | boolean value |
| resources | raw markdown text |
| title | a string no longer than 120 characters |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_live_happening_now)

### GET /api/live/happening\_now[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get some basic information about the currently featured live thread.

Returns an empty 204 response for api requests if no thread is currently featured.

See also: [/api/live/*thread*/about](#GET_api_live_%7Bthread%7D_about).

|  |  |
| --- | --- |
| show\_announcements | boolean value |

[#](#POST_api_live_{thread}_accept_contributor_invite)

### POST /api/live/*thread*/accept\_contributor\_invite[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Accept a pending invitation to contribute to the thread.

See also: [/api/live/*thread*/leave\_contributor](#POST_api_live_%7Bthread%7D_leave_contributor).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_close_thread)

### POST /api/live/*thread*/close\_thread[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Permanently close the thread, disallowing future updates.

Requires the `close` permission for this thread.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_delete_update)

### POST /api/live/*thread*/delete\_update[edit](https://github.com/reddit/reddit/wiki/OAuth2)

Delete an update from the thread.

Requires that specified update must have been authored by the user or
that you have the `edit` permission for this thread.

See also: [/api/live/*thread*/update](#POST_api_live_%7Bthread%7D_update).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id | the ID of a single update. e.g. `LiveUpdate_ff87068e-a126-11e3-9f93-12313b0b3603` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_edit)

### POST /api/live/*thread*/edit[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Configure the thread.

Requires the `settings` permission for this thread.

See also: [/live/*thread*/about.json](#GET_live_%7Bthread%7D_about.json).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| description | raw markdown text |
| nsfw | boolean value |
| resources | raw markdown text |
| title | a string no longer than 120 characters |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_hide_discussion)

### POST /api/live/*thread*/hide\_discussion[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Hide a linked comment thread from the discussions sidebar and listing.

Requires the `discussions` permission for this thread.

See also: [/api/live/*thread*/unhide\_discussion](#POST_api_live_%7Bthread%7D_unhide_discussion).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| link | The base 36 ID of a Link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_invite_contributor)

### POST /api/live/*thread*/invite\_contributor[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Invite another user to contribute to the thread.

Requires the `manage` permission for this thread. If the recipient
accepts the invite, they will be granted the permissions specified.

See also: [/api/live/*thread*/accept\_contributor\_invite](#POST_api_live_%7Bthread%7D_accept_contributor_invite), and
[/api/live/*thread*/rm\_contributor\_invite](#POST_api_live_%7Bthread%7D_rm_contributor_invite).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| name | the name of an existing user |
| permissions | permission description e.g. `+update,+edit,-manage` |
| type | one of (`liveupdate_contributor_invite`, `liveupdate_contributor`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_leave_contributor)

### POST /api/live/*thread*/leave\_contributor[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Abdicate contributorship of the thread.

See also: [/api/live/*thread*/accept\_contributor\_invite](#POST_api_live_%7Bthread%7D_accept_contributor_invite), and
[/api/live/*thread*/invite\_contributor](#POST_api_live_%7Bthread%7D_invite_contributor).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_report)

### POST /api/live/*thread*/report[report](https://github.com/reddit/reddit/wiki/OAuth2)

Report the thread for violating the rules of reddit.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| type | one of (`spam`, `vote-manipulation`, `personal-information`, `sexualizing-minors`, `site-breaking`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_rm_contributor)

### POST /api/live/*thread*/rm\_contributor[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Revoke another user's contributorship.

Requires the `manage` permission for this thread.

See also: [/api/live/*thread*/invite\_contributor](#POST_api_live_%7Bthread%7D_invite_contributor).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id | [fullname](#fullnames) of a account |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_rm_contributor_invite)

### POST /api/live/*thread*/rm\_contributor\_invite[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Revoke an outstanding contributor invite.

Requires the `manage` permission for this thread.

See also: [/api/live/*thread*/invite\_contributor](#POST_api_live_%7Bthread%7D_invite_contributor).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id | [fullname](#fullnames) of a account |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_set_contributor_permissions)

### POST /api/live/*thread*/set\_contributor\_permissions[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Change a contributor or contributor invite's permissions.

Requires the `manage` permission for this thread.

See also: [/api/live/*thread*/invite\_contributor](#POST_api_live_%7Bthread%7D_invite_contributor) and
[/api/live/*thread*/rm\_contributor](#POST_api_live_%7Bthread%7D_rm_contributor).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| name | the name of an existing user |
| permissions | permission description e.g. `+update,+edit,-manage` |
| type | one of (`liveupdate_contributor_invite`, `liveupdate_contributor`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_strike_update)

### POST /api/live/*thread*/strike\_update[edit](https://github.com/reddit/reddit/wiki/OAuth2)

Strike (mark incorrect and cross out) the content of an update.

Requires that specified update must have been authored by the user or
that you have the `edit` permission for this thread.

See also: [/api/live/*thread*/update](#POST_api_live_%7Bthread%7D_update).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| id | the ID of a single update. e.g. `LiveUpdate_ff87068e-a126-11e3-9f93-12313b0b3603` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_unhide_discussion)

### POST /api/live/*thread*/unhide\_discussion[livemanage](https://github.com/reddit/reddit/wiki/OAuth2)

Unhide a linked comment thread from the discussions sidebar and listing..

Requires the `discussions` permission for this thread.

See also: [/api/live/*thread*/hide\_discussion](#POST_api_live_%7Bthread%7D_hide_discussion).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| link | The base 36 ID of a Link |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_live_{thread}_update)

### POST /api/live/*thread*/update[submit](https://github.com/reddit/reddit/wiki/OAuth2)

Post an update to the thread.

Requires the `update` permission for this thread.

See also: [/api/live/*thread*/strike\_update](#POST_api_live_%7Bthread%7D_strike_update), and
[/api/live/*thread*/delete\_update](#POST_api_live_%7Bthread%7D_delete_update).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| body | raw markdown text |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_live_{thread})

### GET /live/*thread*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Get a list of updates posted in this thread.

See also: [/api/live/*thread*/update](#POST_api_live_%7Bthread%7D_update).

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | the ID of a single update. e.g. `LiveUpdate_ff87068e-a126-11e3-9f93-12313b0b3603` |
| before | the ID of a single update. e.g. `LiveUpdate_ff87068e-a126-11e3-9f93-12313b0b3603` |
| count | a positive integer (default: 0) |
| is\_embed | (internal use only) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| stylesr | subreddit name |

[#](#GET_live_{thread}_about)

### GET /live/*thread*/about[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get some basic information about the live thread.

See also: [/api/live/*thread*/edit](#POST_api_live_%7Bthread%7D_edit).

[#](#GET_live_{thread}_contributors)

### GET /live/*thread*/contributors[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get a list of users that contribute to this thread.

See also: [/api/live/*thread*/invite\_contributor](#POST_api_live_%7Bthread%7D_invite_contributor), and
[/api/live/*thread*/rm\_contributor](#POST_api_live_%7Bthread%7D_rm_contributor).

[#](#GET_live_{thread}_discussions)

### GET /live/*thread*/discussions[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Get a list of reddit submissions linking to this thread.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_live_{thread}_updates_{update_id})

### GET /live/*thread*/updates/*update\_id*[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get details about a specific update in a live thread.

## private messages

[#](#POST_api_block)

### POST /api/block[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

For blocking the author of a thing via inbox.
Only accessible to approved OAuth applications

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_collapse_message)

### POST /api/collapse\_message[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

Collapse a message

See also: [/api/uncollapse\_message](#POST_uncollapse_message)

|  |  |
| --- | --- |
| id | A comma-separated list of thing [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_compose)

### POST /api/compose[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

Handles message composition under /message/compose.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| from\_sr | subreddit name |
| g-recaptcha-response |  |
| subject | a string no longer than 100 characters |
| text | raw markdown text |
| to | the name of an existing user |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_del_msg)

### POST /api/del\_msg[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

Delete messages from the recipient's view of their inbox.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_read_all_messages)

### POST /api/read\_all\_messages[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

Queue up marking all messages for a user as read.

This may take some time, and returns 202 to acknowledge acceptance of
the request.

|  |  |
| --- | --- |
| filter\_types | A comma-separated list of items |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_read_message)

### POST /api/read\_message[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| id | A comma-separated list of thing [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unblock_subreddit)

### POST /api/unblock\_subreddit[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_uncollapse_message)

### POST /api/uncollapse\_message[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

Uncollapse a message

See also: [/api/collapse\_message](#POST_collapse_message)

|  |  |
| --- | --- |
| id | A comma-separated list of thing [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unread_message)

### POST /api/unread\_message[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| id | A comma-separated list of thing [fullnames](#fullnames) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_message_{where})

### GET /message/*where*[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /message/inbox
* → /message/unread
* → /message/sent

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| mark | one of (`true`, `false`) |
| max\_replies | the maximum number of items desired (default: 0, maximum: 300) |
| mid |  |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

## misc

[#](#GET_api_v1_scopes)

### GET /api/v1/scopes[any](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve descriptions of reddit's OAuth2 scopes.

If no scopes are given, information on all scopes are returned.

Invalid scope(s) will result in a 400 error with body that indicates
the invalid scope(s).

|  |  |
| --- | --- |
| scopes | (optional) An OAuth2 scope string |

## moderation

[#](#GET_about_log)

### GET [/r/*subreddit*]/about/log[modlog](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Get a list of recent moderation actions.

Moderator actions taken within a subreddit are logged. This listing is
a view of that log with various filters to aid in analyzing the
information.

The optional `mod` parameter can be a comma-delimited list of moderator
names to restrict the results to, or the string `a` to restrict the
results to admin actions taken within the subreddit.

The `type` parameter is optional and if sent limits the log entries
returned to only those of the type specified.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | a ModAction ID |
| before | a ModAction ID |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 500) |
| mod | (optional) a moderator filter |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |
| type | one of (`banuser`, `unbanuser`, `spamlink`, `removelink`, `approvelink`, `spamcomment`, `removecomment`, `approvecomment`, `addmoderator`, `showcomment`, `invitemoderator`, `uninvitemoderator`, `acceptmoderatorinvite`, `removemoderator`, `addcontributor`, `removecontributor`, `editsettings`, `editflair`, `distinguish`, `marknsfw`, `wikibanned`, `wikicontributor`, `wikiunbanned`, `wikipagelisted`, `removewikicontributor`, `wikirevise`, `wikipermlevel`, `ignorereports`, `unignorereports`, `setpermissions`, `setsuggestedsort`, `sticky`, `unsticky`, `setcontestmode`, `unsetcontestmode`, `lock`, `unlock`, `muteuser`, `unmuteuser`, `createrule`, `editrule`, `reorderrules`, `deleterule`, `spoiler`, `unspoiler`, `modmail_enrollment`, `community_status`, `community_styling`, `community_welcome_page`, `community_widgets`, `markoriginalcontent`, `collections`, `events`, `hidden_award`, `add_community_topics`, `remove_community_topics`, `create_scheduled_post`, `edit_scheduled_post`, `delete_scheduled_post`, `submit_scheduled_post`, `edit_comment_requirements`, `edit_post_requirements`, `invitesubscriber`, `submit_content_rating_survey`, `adjust_post_crowd_control_level`, `enable_post_crowd_control_filter`, `disable_post_crowd_control_filter`, `deleteoverriddenclassification`, `overrideclassification`, `reordermoderators`, `request_assistance`, `snoozereports`, `unsnoozereports`, `addnote`, `deletenote`, `addremovalreason`, `createremovalreason`, `updateremovalreason`, `deleteremovalreason`, `reorderremovalreason`, `dev_platform_app_changed`, `dev_platform_app_disabled`, `dev_platform_app_enabled`, `dev_platform_app_installed`, `dev_platform_app_uninstalled`, `edit_saved_response`, `chat_approve_message`, `chat_remove_message`, `chat_ban_user`, `chat_unban_user`, `chat_invite_host`, `chat_remove_host`, `approve_award`) |

[#](#GET_about_{location})

### GET [/r/*subreddit*]/about/*location*[read](https://github.com/reddit/reddit/wiki/OAuth2)

* → [/r/*subreddit*]/about/reports
* → [/r/*subreddit*]/about/spam
* → [/r/*subreddit*]/about/modqueue
* → [/r/*subreddit*]/about/unmoderated
* → [/r/*subreddit*]/about/edited

Return a listing of posts relevant to moderators.

* reports: Things that have been reported.
* spam: Things that have been marked as spam or otherwise removed.
* modqueue: Things requiring moderator review, such as reported things
  and items caught by the spam filter.
* unmoderated: Things that have yet to be approved/removed by a mod.
* edited: Things that have been edited recently.

Requires the "posts" moderator permission for the subreddit.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| location |  |
| only | one of (`links`, `comments`, `chat_comments`) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#POST_api_accept_moderator_invite)

### POST [/r/*subreddit*]/api/accept\_moderator\_invite[modself](https://github.com/reddit/reddit/wiki/OAuth2)

Accept an invite to moderate the specified subreddit.

The authenticated user must have been invited to moderate the subreddit
by one of its current moderators.

See also: [/api/friend](#POST_api_friend) and
[/subreddits/mine](#GET_subreddits_mine_%7Bwhere%7D).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_approve)

### POST /api/approve[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Approve a link or comment.

If the thing was removed, it will be re-inserted into appropriate
listings. Any reports on the approved thing will be discarded.

See also: [/api/remove](#POST_api_remove).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_distinguish)

### POST /api/distinguish[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Distinguish a thing's author with a sigil.

This can be useful to draw attention to and confirm the identity of the
user in the context of a link or comment of theirs. The options for
distinguish are as follows:

* `yes` - add a moderator distinguish (`[M]`). only if the user is a
  moderator of the subreddit the thing is in.
* `no` - remove any distinguishes.
* `admin` - add an admin distinguish (`[A]`). admin accounts only.
* `special` - add a user-specific distinguish. depends on user.

The first time a top-level comment is moderator distinguished, the
author of the link the comment is in reply to will get a notification
in their inbox.

`sticky` is a boolean flag for comments, which will stick the
distingushed comment to the top of all comments threads. If a comment
is marked sticky, it will override any other stickied comment for that
link (as only one comment may be stickied at a time.) Only top-level
comments may be stickied.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| how | one of (`yes`, `no`, `admin`, `special`) |
| id | [fullname](#fullnames) of a thing |
| sticky | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_ignore_reports)

### POST /api/ignore\_reports[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Prevent future reports on a thing from causing notifications.

Any reports made about a thing after this flag is set on it will not
cause notifications or make the thing show up in the various moderation
listings.

See also: [/api/unignore\_reports](#POST_api_unignore_reports).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_leavecontributor)

### POST /api/leavecontributor[modself](https://github.com/reddit/reddit/wiki/OAuth2)

Abdicate approved user status in a subreddit.

See also: [/api/friend](#POST_api_friend).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_leavemoderator)

### POST /api/leavemoderator[modself](https://github.com/reddit/reddit/wiki/OAuth2)

Abdicate moderator status in a subreddit.

See also: [/api/friend](#POST_api_friend).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_remove)

### POST /api/remove[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Remove a link, comment, or modmail message.

If the thing is a link, it will be removed from all subreddit listings.
If the thing is a comment, it will be redacted and removed from all
subreddit comment listings.

See also: [/api/approve](#POST_api_approve).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| spam | boolean value |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_show_comment)

### POST /api/show\_comment[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Mark a comment that it should not be collapsed because of crowd control.

The comment could still be collapsed for other reasons.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_snooze_reports)

### POST /api/snooze\_reports[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Prevent future reports on a thing from causing notifications.

For users who reported this thing (post, comment, etc) with
the given report reason, reports from those users in the
next 7 days will not be escalated to moderators.
See also: [/api/unsnooze\_reports](#POST_api_unsnooze_reports).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| reason |  |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unignore_reports)

### POST /api/unignore\_reports[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Allow future reports on a thing to cause notifications.

See also: [/api/ignore\_reports](#POST_api_ignore_reports).

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unsnooze_reports)

### POST /api/unsnooze\_reports[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

For users whose reports were snoozed
(see [/api/snooze\_reports](#POST_api_snooze_reports)),
to go back to escalating future reports from those users.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| reason |  |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_update_crowd_control_level)

### POST /api/update\_crowd\_control\_level[modposts](https://github.com/reddit/reddit/wiki/OAuth2)

Change the post's crowd control level.

|  |  |
| --- | --- |
| id | [fullname](#fullnames) of a thing |
| level | an integer between 0 and 3 |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_stylesheet)

### GET [/r/*subreddit*]/stylesheet[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Redirect to the subreddit's stylesheet if one exists.

See also: [/api/subreddit\_stylesheet](#POST_api_subreddit_stylesheet).

## new modmail

[#](#POST_api_mod_bulk_read)

### POST /api/mod/bulk\_read[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks all conversations read for a particular conversation state
within the passed list of subreddits.

|  |  |
| --- | --- |
| entity | comma-delimited list of subreddit names |
| state | one of (`all`, `appeals`, `notifications`, `inbox`, `filtered`, `inprogress`, `mod`, `archived`, `default`, `highlighted`, `join_requests`, `new`) |

[#](#GET_api_mod_conversations)

### GET /api/mod/conversations[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Get conversations for a logged in user or subreddits

|  |  |
| --- | --- |
| after | A Modmail Conversation ID, in the form ModmailConversation\_<id> |
| entity | comma-delimited list of subreddit names |
| limit | an integer between 1 and 100 (default: 25) |
| sort | one of (`recent`, `mod`, `user`, `unread`) |
| state | one of (`all`, `appeals`, `notifications`, `inbox`, `filtered`, `inprogress`, `mod`, `archived`, `default`, `highlighted`, `join_requests`, `new`) |

[#](#POST_api_mod_conversations)

### POST /api/mod/conversations[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Creates a new conversation for a particular SR.

This endpoint will create a ModmailConversation object as
well as the first ModmailMessage within the ModmailConversation
object.

A note on `to`:

The `to` field for this endpoint is somewhat confusing. It can be:

* A User, passed like "username" or "[u/username](/u/username)"
* A Subreddit, passed like "[r/subreddit](/r/subreddit)"
* null, meaning an internal moderator discussion

In this way `to` is a bit of a misnomer in modmail conversations. What
it really means is the participant of the conversation who is not a mod
of the subreddit.

|  |  |
| --- | --- |
| body | raw markdown text |
| isAuthorHidden | boolean value |
| srName | subreddit name |
| subject | a string no longer than 100 characters |
| to | Modmail conversation recipient [fullname](#fullname) |

[#](#GET_api_mod_conversations_:conversation_id)

### GET /api/mod/conversations/:conversation\_id[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Returns all messages, mod actions and conversation metadata
for a given conversation id

|  |  |
| --- | --- |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |
| markRead | boolean value |

[#](#POST_api_mod_conversations_:conversation_id)

### POST /api/mod/conversations/:conversation\_id[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Creates a new message for a particular conversation.

|  |  |
| --- | --- |
| body | raw markdown text |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |
| isAuthorHidden | boolean value |
| isInternal | boolean value |

[#](#POST_api_mod_conversations_:conversation_id_approve)

### POST /api/mod/conversations/:conversation\_id/approve[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Approve the non mod user associated with a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |

[#](#POST_api_mod_conversations_:conversation_id_archive)

### POST /api/mod/conversations/:conversation\_id/archive[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks a conversation as archived.

|  |  |
| --- | --- |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |

[#](#POST_api_mod_conversations_:conversation_id_disapprove)

### POST /api/mod/conversations/:conversation\_id/disapprove[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Disapprove the non mod user associated with a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |

[#](#DELETE_api_mod_conversations_:conversation_id_highlight)

### DELETE /api/mod/conversations/:conversation\_id/highlight[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Removes a highlight from a conversation.

|  |  |
| --- | --- |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |

[#](#POST_api_mod_conversations_:conversation_id_highlight)

### POST /api/mod/conversations/:conversation\_id/highlight[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks a conversation as highlighted.

|  |  |
| --- | --- |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |

[#](#POST_api_mod_conversations_:conversation_id_mute)

### POST /api/mod/conversations/:conversation\_id/mute[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Mutes the non mod user associated with a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |
| num\_hours | one of (`72`, `168`, `672`) |

[#](#POST_api_mod_conversations_:conversation_id_temp_ban)

### POST /api/mod/conversations/:conversation\_id/temp\_ban[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Temporary ban (switch from permanent to temporary ban) the non mod
user associated with a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |
| duration | an integer between 1 and 999 |

[#](#POST_api_mod_conversations_:conversation_id_unarchive)

### POST /api/mod/conversations/:conversation\_id/unarchive[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks conversation as unarchived.

|  |  |
| --- | --- |
| conversation\_id | A Modmail Conversation ID, in the form ModmailConversation\_<id> |

[#](#POST_api_mod_conversations_:conversation_id_unban)

### POST /api/mod/conversations/:conversation\_id/unban[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Unban the non mod user associated with a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |

[#](#POST_api_mod_conversations_:conversation_id_unmute)

### POST /api/mod/conversations/:conversation\_id/unmute[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Unmutes the non mod user associated with
a particular conversation.

|  |  |
| --- | --- |
| conversation\_id | base36 modmail conversation id |

[#](#POST_api_mod_conversations_read)

### POST /api/mod/conversations/read[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks a conversations as read for the user.

|  |  |
| --- | --- |
| conversationIds | A comma-separated list of items |

[#](#GET_api_mod_conversations_subreddits)

### GET /api/mod/conversations/subreddits[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Returns a list of srs that the user moderates with mail permission

[#](#POST_api_mod_conversations_unread)

### POST /api/mod/conversations/unread[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Marks conversations as unread for the user.

|  |  |
| --- | --- |
| conversationIds | A comma-separated list of items |

[#](#GET_api_mod_conversations_unread_count)

### GET /api/mod/conversations/unread/count[modmail](https://github.com/reddit/reddit/wiki/OAuth2)

Endpoint to retrieve the unread conversation count by
conversation state.

## modnote

[#](#DELETE_api_mod_notes)

### DELETE /api/mod/notes[modnote](https://github.com/reddit/reddit/wiki/OAuth2)

Delete a mod user note where type=NOTE.

Parameters should be passed as query parameters.

|  |  |
| --- | --- |
| note\_id | a unique ID for the note to be deleted (should have a ModNote\_ prefix) |
| subreddit | subreddit name |
| user | account username |

[#](#GET_api_mod_notes)

### GET /api/mod/notes[modnote](https://github.com/reddit/reddit/wiki/OAuth2)

Get mod notes for a specific user in a given subreddit.

|  |  |
| --- | --- |
| before | (optional) an encoded string used for pagination with mod notes |
| filter | (optional) one of (NOTE, APPROVAL, REMOVAL, BAN, MUTE, INVITE, SPAM, CONTENT\_CHANGE, MOD\_ACTION, ALL), to be used for querying specific types of mod notes (default: all) |
| limit | (optional) the number of mod notes to return in the response payload (default: 25, max: 100)'} |
| subreddit | subreddit name |
| user | account username |

[#](#POST_api_mod_notes)

### POST /api/mod/notes[modnote](https://github.com/reddit/reddit/wiki/OAuth2)

Create a mod user note where type=NOTE.

|  |  |
| --- | --- |
| label | (optional) one of (BOT\_BAN, PERMA\_BAN, BAN, ABUSE\_WARNING, SPAM\_WARNING, SPAM\_WATCH, SOLID\_CONTRIBUTOR, HELPFUL\_USER) |
| note | Content of the note, should be a string with a maximum character limit of 250 |
| reddit\_id | (optional) a fullname of a comment or post (should have either a t1 or t3 prefix) |
| subreddit | subreddit name |
| user | account username |

[#](#GET_api_mod_notes_recent)

### GET /api/mod/notes/recent[modnote](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch the most recent notes written by a moderator

Both parameters should be comma separated lists of equal lengths.
The first subreddit will be paired with the first account to represent
a query for a mod written note for that account in that subreddit and so
forth for all subsequent pairs of subreddits and accounts.
This request accepts up to 500 pairs of subreddit names and usernames.
Parameters should be passed as query parameters.

The response will be a list of mod notes in the order that subreddits and accounts
were given. If no note exist for a given subreddit/account pair, then null
will take its place in the list.

|  |  |
| --- | --- |
| subreddits | a comma delimited list of subreddits by name |
| users | a comma delimited list of usernames |

## multis

[#](#POST_api_multi_copy)

### POST /api/multi/copy[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

Copy a multi.

Responds with 409 Conflict if the target already exists.

A "copied from ..." line will automatically be appended to the
description.

|  |  |
| --- | --- |
| description\_md | raw markdown text |
| display\_name | a string no longer than 50 characters |
| expand\_srs | boolean value |
| from | multireddit url path |
| to | destination multireddit url path |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_multi_mine)

### GET /api/multi/mine[read](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch a list of multis belonging to the current user.

|  |  |
| --- | --- |
| expand\_srs | boolean value |

[#](#GET_api_multi_user_{username})

### GET /api/multi/user/*username*[read](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch a list of public multis belonging to `username`

|  |  |
| --- | --- |
| expand\_srs | boolean value |
| username | A valid, existing reddit username |

[#](#DELETE_api_multi_{multipath})

### DELETE /api/multi/*multipath*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*

Delete a multi.

|  |  |
| --- | --- |
| multipath | multireddit url path |
| uh / X-Modhash header | a [modhash](#modhashes) |
| expand\_srs | boolean value |

[#](#GET_api_multi_{multipath})

### GET /api/multi/*multipath*[read](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*

Fetch a multi's data and subreddit list by name.

|  |  |
| --- | --- |
| expand\_srs | boolean value |
| multipath | multireddit url path |

[#](#POST_api_multi_{multipath})

### POST /api/multi/*multipath*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*

Create a multi. Responds with 409 Conflict if it already exists.

|  |  |
| --- | --- |
| model | json data:   ``` {   "description_md": raw markdown text,   "display_name": a string no longer than 50 characters,   "icon_img": one of (`png`, `jpg`, `jpeg`),   "key_color": a 6-digit rgb hex color, e.g. `#AABBCC`,   "subreddits": [     {       "name": subreddit name,     },     ...   ],   "visibility": one of (`private`, `public`, `hidden`), }  ``` |
| multipath | multireddit url path |
| uh / X-Modhash header | a [modhash](#modhashes) |
| expand\_srs | boolean value |

[#](#PUT_api_multi_{multipath})

### PUT /api/multi/*multipath*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*

Create or update a multi.

|  |  |
| --- | --- |
| expand\_srs | boolean value |
| model | json data:   ``` {   "description_md": raw markdown text,   "display_name": a string no longer than 50 characters,   "icon_img": one of (`png`, `jpg`, `jpeg`),   "key_color": a 6-digit rgb hex color, e.g. `#AABBCC`,   "subreddits": [     {       "name": subreddit name,     },     ...   ],   "visibility": one of (`private`, `public`, `hidden`), }  ``` |
| multipath | multireddit url path |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_multi_{multipath}_description)

### GET /api/multi/*multipath*/description[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get a multi's description.

|  |  |
| --- | --- |
| multipath | multireddit url path |

[#](#PUT_api_multi_{multipath}_description)

### PUT /api/multi/*multipath*/description[read](https://github.com/reddit/reddit/wiki/OAuth2)

Change a multi's markdown description.

|  |  |
| --- | --- |
| model | json data:   ``` {   "body_md": raw markdown text, }  ``` |
| multipath | multireddit url path |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#DELETE_api_multi_{multipath}_r_{srname})

### DELETE /api/multi/*multipath*/r/*srname*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*/r/*srname*

Remove a subreddit from a multi.

|  |  |
| --- | --- |
| multipath | multireddit url path |
| srname | subreddit name |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_multi_{multipath}_r_{srname})

### GET /api/multi/*multipath*/r/*srname*[read](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*/r/*srname*

Get data about a subreddit in a multi.

|  |  |
| --- | --- |
| multipath | multireddit url path |
| srname | subreddit name |

[#](#PUT_api_multi_{multipath}_r_{srname})

### PUT /api/multi/*multipath*/r/*srname*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

* → /api/filter/*filterpath*/r/*srname*

Add a subreddit to a multi.

|  |  |
| --- | --- |
| model | json data:   ``` {   "name": subreddit name, }  ``` |
| multipath | multireddit url path |
| srname | subreddit name |
| uh / X-Modhash header | a [modhash](#modhashes) |

## search

[#](#GET_search)

### GET [/r/*subreddit*]/search[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Search links page.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| category | a string no longer than 5 characters |
| count | a positive integer (default: 0) |
| include\_facets | boolean value |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| q | a string no longer than 512 characters |
| restrict\_sr | boolean value |
| show | (optional) the string `all` |
| sort | one of (`relevance`, `hot`, `top`, `new`, `comments`) |
| sr\_detail | (optional) expand subreddits |
| t | one of (`hour`, `day`, `week`, `month`, `year`, `all`) |
| type | (optional) comma-delimited list of result types (`sr`, `link`, `user`) |

## subreddits

[#](#GET_about_{where})

### GET [/r/*subreddit*]/about/*where*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → [/r/*subreddit*]/about/banned
* → [/r/*subreddit*]/about/muted
* → [/r/*subreddit*]/about/wikibanned
* → [/r/*subreddit*]/about/contributors
* → [/r/*subreddit*]/about/wikicontributors
* → [/r/*subreddit*]/about/moderators

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |
| user | A valid, existing reddit username |

[#](#POST_api_delete_sr_banner)

### POST [/r/*subreddit*]/api/delete\_sr\_banner[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Remove the subreddit's custom mobile banner.

See also: [/api/upload\_sr\_img](#POST_api_upload_sr_img).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_delete_sr_header)

### POST [/r/*subreddit*]/api/delete\_sr\_header[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Remove the subreddit's custom header image.

The sitewide-default header image will be shown again after this call.

See also: [/api/upload\_sr\_img](#POST_api_upload_sr_img).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_delete_sr_icon)

### POST [/r/*subreddit*]/api/delete\_sr\_icon[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Remove the subreddit's custom mobile icon.

See also: [/api/upload\_sr\_img](#POST_api_upload_sr_img).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_delete_sr_img)

### POST [/r/*subreddit*]/api/delete\_sr\_img[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Remove an image from the subreddit's custom image set.

The image will no longer count against the subreddit's image limit.
However, the actual image data may still be accessible for an
unspecified amount of time. If the image is currently referenced by the
subreddit's stylesheet, that stylesheet will no longer validate and
won't be editable until the image reference is removed.

See also: [/api/upload\_sr\_img](#POST_api_upload_sr_img).

|  |  |
| --- | --- |
| api\_type | the string `json` |
| img\_name | a valid subreddit image name |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_recommend_sr_{srnames})

### GET /api/recommend/sr/*srnames*[read](https://github.com/reddit/reddit/wiki/OAuth2)

DEPRECATED: Return subreddits recommended for the given subreddit(s).

Gets a list of subreddits recommended for `srnames`, filtering out any
that appear in the optional `omit` param.

|  |  |
| --- | --- |
| omit | comma-delimited list of subreddit names |
| over\_18 | boolean value |
| srnames | comma-delimited list of subreddit names |

[#](#GET_api_search_reddit_names)

### GET /api/search\_reddit\_names[read](https://github.com/reddit/reddit/wiki/OAuth2)

List subreddit names that begin with a query string.

Subreddits whose names begin with `query` will be returned. If
`include_over_18` is false, subreddits with over-18 content
restrictions will be filtered from the results.

If `include_unadvertisable` is False, subreddits that have `hide_ads`
set to True or are on the `anti_ads_subreddits` list will be filtered.

If `exact` is true, only an exact match will be returned. Exact matches
are inclusive of `over_18` subreddits, but not `hide_ad` subreddits
when `include_unadvertisable` is `False`.

|  |  |
| --- | --- |
| exact | boolean value |
| include\_over\_18 | boolean value |
| include\_unadvertisable | boolean value |
| query | a string up to 50 characters long, consisting of printable characters. |
| search\_query\_id | a uuid |
| typeahead\_active | boolean value or None |

[#](#POST_api_search_reddit_names)

### POST /api/search\_reddit\_names[read](https://github.com/reddit/reddit/wiki/OAuth2)

List subreddit names that begin with a query string.

Subreddits whose names begin with `query` will be returned. If
`include_over_18` is false, subreddits with over-18 content
restrictions will be filtered from the results.

If `include_unadvertisable` is False, subreddits that have `hide_ads`
set to True or are on the `anti_ads_subreddits` list will be filtered.

If `exact` is true, only an exact match will be returned. Exact matches
are inclusive of `over_18` subreddits, but not `hide_ad` subreddits
when `include_unadvertisable` is `False`.

|  |  |
| --- | --- |
| exact | boolean value |
| include\_over\_18 | boolean value |
| include\_unadvertisable | boolean value |
| query | a string up to 50 characters long, consisting of printable characters. |
| search\_query\_id | a uuid |
| typeahead\_active | boolean value or None |

[#](#POST_api_search_subreddits)

### POST /api/search\_subreddits[read](https://github.com/reddit/reddit/wiki/OAuth2)

List subreddits that begin with a query string.

Subreddits whose names begin with `query` will be returned. If
`include_over_18` is false, subreddits with over-18 content
restrictions will be filtered from the results.

If `include_unadvertisable` is False, subreddits that have `hide_ads`
set to True or are on the `anti_ads_subreddits` list will be filtered.

If `exact` is true, only an exact match will be returned. Exact matches
are inclusive of `over_18` subreddits, but not `hide_ad` subreddits
when `include_unadvertisable` is `False`.

|  |  |
| --- | --- |
| exact | boolean value |
| include\_over\_18 | boolean value |
| include\_unadvertisable | boolean value |
| query | a string up to 50 characters long, consisting of printable characters. |
| search\_query\_id | a uuid |
| typeahead\_active | boolean value or None |

[#](#POST_api_site_admin)

### POST /api/site\_admin[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Create or configure a subreddit.

If `sr` is specified, the request will attempt to modify the specified
subreddit. If not, a subreddit with name `name` will be created.

This endpoint expects *all* values to be supplied on every request. If
modifying a subset of options, it may be useful to get the current
settings from [/about/edit.json](#GET_r_%7Bsubreddit%7D_about_edit.json)
first.

For backwards compatibility, `description` is the sidebar text and
`public_description` is the publicly visible subreddit description.

Most of the parameters for this endpoint are identical to options
visible in the user interface and their meanings are best explained
there.

See also: [/about/edit.json](#GET_r_%7Bsubreddit%7D_about_edit.json).

|  |  |
| --- | --- |
| accept\_followers | boolean value |
| admin\_override\_spam\_comments | boolean value |
| admin\_override\_spam\_links | boolean value |
| admin\_override\_spam\_selfposts | boolean value |
| all\_original\_content | boolean value |
| allow\_chat\_post\_creation | boolean value |
| allow\_discovery | boolean value |
| allow\_galleries | boolean value |
| allow\_images | boolean value |
| allow\_polls | boolean value |
| allow\_post\_crossposts | boolean value |
| allow\_prediction\_contributors | boolean value |
| allow\_predictions | boolean value |
| allow\_predictions\_tournament | boolean value |
| allow\_talks | boolean value |
| allow\_top | boolean value |
| allow\_videos | boolean value |
| api\_type | the string `json` |
| collapse\_deleted\_comments | boolean value |
| comment\_contribution\_settings | json data:   ``` {   "allowed_media_types": [     one of (`unknown`, `giphy`, `static`, `video`, `animated`, `expression`),     ...   ], }  ``` |
| comment\_score\_hide\_mins | an integer between 0 and 1440 (default: 0) |
| crowd\_control\_chat\_level | an integer between 0 and 3 |
| crowd\_control\_filter | boolean value |
| crowd\_control\_level | an integer between 0 and 3 |
| crowd\_control\_mode | boolean value |
| crowd\_control\_post\_level | an integer between 0 and 3 |
| description | raw markdown text |
| disable\_contributor\_requests | boolean value |
| exclude\_banned\_modqueue | boolean value |
| free\_form\_reports | boolean value |
| g-recaptcha-response |  |
| hateful\_content\_threshold\_abuse | an integer between 0 and 3 |
| hateful\_content\_threshold\_identity | an integer between 0 and 3 |
| header-title | a string no longer than 500 characters |
| hide\_ads | boolean value |
| key\_color | a 6-digit rgb hex color, e.g. `#AABBCC` |
| link\_type | one of (`any`, `link`, `self`) |
| modmail\_harassment\_filter\_enabled | boolean value |
| name | subreddit name |
| new\_pinned\_post\_pns\_enabled | boolean value |
| original\_content\_tag\_enabled | boolean value |
| over\_18 | boolean value |
| prediction\_leaderboard\_entry\_type | an integer between 0 and 2 |
| public\_description | raw markdown text |
| restrict\_commenting | boolean value |
| restrict\_posting | boolean value |
| should\_archive\_posts | boolean value |
| show\_media | boolean value |
| show\_media\_preview | boolean value |
| spam\_comments | one of (`low`, `high`, `all`) |
| spam\_links | one of (`low`, `high`, `all`) |
| spam\_selfposts | one of (`low`, `high`, `all`) |
| spoilers\_enabled | boolean value |
| sr | [fullname](#fullnames) of a thing |
| submit\_link\_label | a string no longer than 60 characters |
| submit\_text | raw markdown text |
| submit\_text\_label | a string no longer than 60 characters |
| subreddit\_discovery\_settings | json data:   ``` {   "disabled_discovery_types": [     one of (`unknown`, `onboarding`),     ...   ], }  ``` |
| suggested\_comment\_sort | one of (`confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`) |
| title | a string no longer than 100 characters |
| toxicity\_threshold\_chat\_level | an integer between 0 and 1 |
| type | one of (`gold_restricted`, `archived`, `restricted`, `private`, `employees_only`, `gold_only`, `public`, `user`) |
| uh / X-Modhash header | a [modhash](#modhashes) |
| user\_flair\_pns\_enabled | boolean value |
| welcome\_message\_enabled | boolean value |
| welcome\_message\_text | raw markdown text |
| wiki\_edit\_age | an integer between 0 and 36600 (default: 0) |
| wiki\_edit\_karma | an integer between 0 and 1000000000 (default: 0) |
| wikimode | one of (`disabled`, `modonly`, `anyone`) |

[#](#GET_api_submit_text)

### GET [/r/*subreddit*]/api/submit\_text[submit](https://github.com/reddit/reddit/wiki/OAuth2)

Get the submission text for the subreddit.

This text is set by the subreddit moderators and intended to be
displayed on the submission form.

See also: [/api/site\_admin](#POST_api_site_admin).

[#](#GET_api_subreddit_autocomplete)

### GET /api/subreddit\_autocomplete[read](https://github.com/reddit/reddit/wiki/OAuth2)

Return a list of subreddits and data for subreddits whose names start
with 'query'.

Uses typeahead endpoint to recieve the list of subreddits names.
Typeahead provides exact matches, typo correction, fuzzy matching and
boosts subreddits to the top that the user is subscribed to.

|  |  |
| --- | --- |
| include\_over\_18 | boolean value |
| include\_profiles | boolean value |
| query | a string up to 25 characters long, consisting of printable characters. |

[#](#GET_api_subreddit_autocomplete_v2)

### GET /api/subreddit\_autocomplete\_v2[read](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| include\_over\_18 | boolean value |
| include\_profiles | boolean value |
| limit | an integer between 1 and 10 (default: 5) |
| query | a string up to 25 characters long, consisting of printable characters. |
| search\_query\_id | a uuid |
| typeahead\_active | boolean value or None |

[#](#POST_api_subreddit_stylesheet)

### POST [/r/*subreddit*]/api/subreddit\_stylesheet[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Update a subreddit's stylesheet.

`op` should be `save` to update the contents of the stylesheet.

|  |  |
| --- | --- |
| api\_type | the string `json` |
| op | one of (`save`, `preview`) |
| reason | a string up to 256 characters long, consisting of printable characters. |
| stylesheet\_contents | the new stylesheet content |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_subscribe)

### POST /api/subscribe[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

Subscribe to or unsubscribe from a subreddit.

To subscribe, `action` should be `sub`. To unsubscribe, `action` should
be `unsub`. The user must have access to the subreddit to be able to
subscribe to it.

The `skip_initial_defaults` param can be set to True to prevent
automatically subscribing the user to the current set of defaults
when they take their first subscription action. Attempting to set it
for an unsubscribe action will result in an error.

See also: [/subreddits/mine/](#GET_subreddits_mine_%7Bwhere%7D).

|  |  |
| --- | --- |
| action | one of (`sub`, `unsub`) |
| action\_source | one of (`onboarding`, `autosubscribe`) |
| skip\_initial\_defaults | boolean value |
| sr / sr\_name | A comma-separated list of subreddit [fullnames](#fullname) (when using the "sr" parameter), or of subreddit names (when using the "sr\_name" parameter). |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_upload_sr_img)

### POST [/r/*subreddit*]/api/upload\_sr\_img[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Add or replace a subreddit image, custom header logo, custom mobile
icon, or custom mobile banner.

* If the `upload_type` value is `img`, an image for use in the
  subreddit stylesheet is uploaded with the name specified in `name`.
* If the `upload_type` value is `header` then the image uploaded will
  be the subreddit's new logo and `name` will be ignored.
* If the `upload_type` value is `icon` then the image uploaded will be
  the subreddit's new mobile icon and `name` will be ignored.
* If the `upload_type` value is `banner` then the image uploaded will
  be the subreddit's new mobile banner and `name` will be ignored.

For backwards compatibility, if `upload_type` is not specified, the
`header` field will be used instead:

* If the `header` field has value `0`, then `upload_type` is `img`.
* If the `header` field has value `1`, then `upload_type` is `header`.

The `img_type` field specifies whether to store the uploaded image as a
PNG or JPEG.

Subreddits have a limited number of images that can be in use at any
given time. If no image with the specified name already exists, one of
the slots will be consumed.

If an image with the specified name already exists, it will be
replaced. This does not affect the stylesheet immediately, but will
take effect the next time the stylesheet is saved.

See also: [/api/delete\_sr\_img](#POST_api_delete_sr_img),
[/api/delete\_sr\_header](#POST_api_delete_sr_header),
[/api/delete\_sr\_icon](#POST_api_delete_sr_icon), and
[/api/delete\_sr\_banner](#POST_api_delete_sr_banner).

|  |  |
| --- | --- |
| file | file upload with maximum size of 500 KiB |
| formid | (optional) can be ignored |
| header | an integer between 0 and 1 |
| img\_type | one of `png` or `jpg` (default: `png`) |
| name | a valid subreddit image name |
| uh / X-Modhash header | a [modhash](#modhashes) |
| upload\_type | one of (`img`, `header`, `icon`, `banner`) |

[#](#GET_api_v1_{subreddit}_post_requirements)

### GET /api/v1/*subreddit*/post\_requirements[submit](https://github.com/reddit/reddit/wiki/OAuth2)

Fetch moderator-designated requirements to post to the subreddit.

Moderators may enable certain restrictions, such as minimum title
length, when making a submission to their subreddit.

Clients may use the values returned by this endpoint to pre-validate
fields before making a request to POST /api/submit. This may allow
the client to provide a better user experience to the user, for
example by creating a text field in their app that does not allow
the user to enter more characters than the max title length.

A non-exhaustive list of possible requirements a moderator may
enable:

* `body_blacklisted_strings`: List of strings. Users may not submit
  posts that contain these words.
* `body_restriction_policy`: String. One of "required", "notAllowed",
  or "none", meaning that a self-post body is required, not allowed, or
  optional, respectively.
* `domain_blacklist`: List of strings. Users may not submit links to
  these domains
* `domain_whitelist`: List of strings. Users submissions MUST be from
  one of these domains
* `is_flair_required`: Boolean. If True, flair must be set at
  submission time.
* `title_blacklisted_strings`: List of strings. Submission titles may
  NOT contain any of the listed strings.
* `title_required_strings`: List of strings. Submission title MUST
  contain at least ONE of the listed strings.
* `title_text_max_length`: Integer. Maximum length of the title field.
* `title_text_min_length`: Integer. Minimum length of the title field.

[#](#GET_r_{subreddit}_about)

### GET /r/*subreddit*/about[read](https://github.com/reddit/reddit/wiki/OAuth2)

Return information about the subreddit.

Data includes the subscriber count, description, and header image.

[#](#GET_r_{subreddit}_about_edit)

### GET /r/*subreddit*/about/edit[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

Get the current settings of a subreddit.

In the API, this returns the current settings of the subreddit as used
by [/api/site\_admin](#POST_api_site_admin). On the HTML site, it will
display a form for editing the subreddit.

|  |  |
| --- | --- |
| created | one of (`true`, `false`) |
| location |  |

[#](#GET_r_{subreddit}_about_rules)

### GET /r/*subreddit*/about/rules[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get the rules for the current subreddit

[#](#GET_r_{subreddit}_about_traffic)

### GET /r/*subreddit*/about/traffic[modconfig](https://github.com/reddit/reddit/wiki/OAuth2)

[#](#GET_sidebar)

### GET [/r/*subreddit*]/sidebar[read](https://github.com/reddit/reddit/wiki/OAuth2)

Get the sidebar for the current subreddit

[#](#GET_sticky)

### GET [/r/*subreddit*]/sticky[read](https://github.com/reddit/reddit/wiki/OAuth2)

Redirect to one of the posts stickied in the current subreddit

The "num" argument can be used to select a specific sticky, and will
default to 1 (the top sticky) if not specified.
Will 404 if there is not currently a sticky post in this subreddit.

|  |  |
| --- | --- |
| num | an integer between 1 and 2 (default: 1) |

[#](#GET_subreddits_mine_{where})

### GET /subreddits/mine/*where*[mysubreddits](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /subreddits/mine/subscriber
* → /subreddits/mine/contributor
* → /subreddits/mine/moderator
* → /subreddits/mine/streams

Get subreddits the user has a relationship with.

The `where` parameter chooses which subreddits are returned as follows:

* `subscriber` - subreddits the user is subscribed to
* `contributor` - subreddits the user is an approved user in
* `moderator` - subreddits the user is a moderator of
* `streams` - subscribed to subreddits that contain hosted video links

See also: [/api/subscribe](#POST_api_subscribe),
[/api/friend](#POST_api_friend), and
[/api/accept\_moderator\_invite](#POST_api_accept_moderator_invite).

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_subreddits_search)

### GET /subreddits/search[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Search subreddits by title and description.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| q | a search query |
| search\_query\_id | a uuid |
| show | (optional) the string `all` |
| show\_users | boolean value |
| sort | one of (`relevance`, `activity`) |
| sr\_detail | (optional) expand subreddits |
| typeahead\_active | boolean value or None |

[#](#GET_subreddits_{where})

### GET /subreddits/*where*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /subreddits/popular
* → /subreddits/new
* → /subreddits/gold
* → /subreddits/default

Get all subreddits.

The `where` parameter chooses the order in which the subreddits are
displayed. `popular` sorts on the activity of the subreddit and the
position of the subreddits can shift around. `new` sorts the subreddits
based on their creation date, newest first.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_users_search)

### GET /users/search[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

Search user profiles by title and description.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| q | a search query |
| search\_query\_id | a uuid |
| show | (optional) the string `all` |
| sort | one of (`relevance`, `activity`) |
| sr\_detail | (optional) expand subreddits |
| typeahead\_active | boolean value or None |

[#](#GET_users_{where})

### GET /users/*where*[read](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /users/popular
* → /users/new

Get all user subreddits.

The `where` parameter chooses the order in which the subreddits are
displayed. `popular` sorts on the activity of the subreddit and the
position of the subreddits can shift around. `new` sorts the user
subreddits based on their creation date, newest first.

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

## users

[#](#POST_api_block_user)

### POST /api/block\_user[account](https://github.com/reddit/reddit/wiki/OAuth2)

For blocking a user. Only accessible to approved OAuth applications

|  |  |
| --- | --- |
| account\_id | [fullname](#fullnames) of a account |
| api\_type | the string `json` |
| name | A valid, existing reddit username |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_friend)

### POST [/r/*subreddit*]/api/friend[any](https://github.com/reddit/reddit/wiki/OAuth2)

Create a relationship between a user and another user or subreddit

OAuth2 use requires appropriate scope based
on the 'type' of the relationship:

* moderator: Use "moderator\_invite"
* moderator\_invite: `modothers`
* contributor: `modcontributors`
* banned: `modcontributors`
* muted: `modcontributors`
* wikibanned: `modcontributors` and `modwiki`
* wikicontributor: `modcontributors` and `modwiki`
* friend: Use [/api/v1/me/friends/{username}](#PUT_api_v1_me_friends_%7Busername%7D)
* enemy: Use [/api/block](#POST_api_block)

Complement to [POST\_unfriend](#POST_api_unfriend)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| ban\_context | [fullname](#fullnames) of a thing |
| ban\_message | raw markdown text |
| ban\_reason | a string no longer than 100 characters |
| container |  |
| duration | an integer between 1 and 999 |
| name | the name of an existing user |
| note | a string no longer than 300 characters |
| permissions |  |
| type | one of (`friend`, `moderator`, `moderator_invite`, `contributor`, `banned`, `muted`, `wikibanned`, `wikicontributor`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_report_user)

### POST /api/report\_user[report](https://github.com/reddit/reddit/wiki/OAuth2)

Report a user.
Reporting a user brings it to the attention of a Reddit admin.

|  |  |
| --- | --- |
| details | JSON data |
| reason | a string no longer than 100 characters |
| ('user',) | A valid, existing reddit username |

[#](#POST_api_setpermissions)

### POST [/r/*subreddit*]/api/setpermissions[modothers](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| name | the name of an existing user |
| permissions |  |
| type |  |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_unfriend)

### POST [/r/*subreddit*]/api/unfriend[any](https://github.com/reddit/reddit/wiki/OAuth2)

Remove a relationship between a user and another user or subreddit

The user can either be passed in by name (nuser)
or by [fullname](#fullnames) (iuser). If type is friend or enemy,
'container' MUST be the current user's fullname;
for other types, the subreddit must be set
via URL (e.g., </r/funny/api/unfriend>)

OAuth2 use requires appropriate scope based
on the 'type' of the relationship:

* moderator: `modothers`
* moderator\_invite: `modothers`
* contributor: `modcontributors`
* banned: `modcontributors`
* muted: `modcontributors`
* wikibanned: `modcontributors` and `modwiki`
* wikicontributor: `modcontributors` and `modwiki`
* friend: Use [/api/v1/me/friends/{username}](#DELETE_api_v1_me_friends_%7Busername%7D)
* enemy: `privatemessages`

Complement to [POST\_friend](#POST_api_friend)

|  |  |
| --- | --- |
| api\_type | the string `json` |
| container |  |
| id | [fullname](#fullnames) of a thing |
| name | the name of an existing user |
| type | one of (`friend`, `enemy`, `moderator`, `moderator_invite`, `contributor`, `banned`, `muted`, `wikibanned`, `wikicontributor`) |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_api_user_data_by_account_ids)

### GET /api/user\_data\_by\_account\_ids[privatemessages](https://github.com/reddit/reddit/wiki/OAuth2)

|  |  |
| --- | --- |
| ids | A comma-separated list of account [fullnames](#fullnames) |

[#](#GET_api_username_available)

### GET /api/username\_available[any](https://github.com/reddit/reddit/wiki/OAuth2)

Check whether a username is available for registration.

|  |  |
| --- | --- |
| user | a valid, unused, username |

[#](#DELETE_api_v1_me_friends_{username})

### DELETE /api/v1/me/friends/*username*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

Stop being friends with a user.

|  |  |
| --- | --- |
| id | A valid, existing reddit username |

[#](#PUT_api_v1_me_friends_{username})

### PUT /api/v1/me/friends/*username*[subscribe](https://github.com/reddit/reddit/wiki/OAuth2)

Create or update a "friend" relationship.

This operation is idempotent. It can be used to add a new
friend, or update an existing friend (e.g., add/change the
note on that friend)

|  |  |
| --- | --- |
| This endpoint expects JSON data of this format | ``` {   "name": A valid, existing reddit username,   "note": a string no longer than 300 characters, }  ``` |

[#](#GET_api_v1_user_{username}_trophies)

### GET /api/v1/user/*username*/trophies[read](https://github.com/reddit/reddit/wiki/OAuth2)

Return a list of trophies for the a given user.

|  |  |
| --- | --- |
| id | A valid, existing reddit username |

[#](#GET_user_{username}_about)

### GET /user/*username*/about[read](https://github.com/reddit/reddit/wiki/OAuth2)

Return information about the user, including karma and gold status.

|  |  |
| --- | --- |
| username | the name of an existing user |

[#](#GET_user_{username}_{where})

### GET /user/*username*/*where*[history](https://github.com/reddit/reddit/wiki/OAuth2)[rss support](https://www.reddit.com/wiki/rss)

* → /user/*username*/overview
* → /user/*username*/submitted
* → /user/*username*/comments
* → /user/*username*/upvoted
* → /user/*username*/downvoted
* → /user/*username*/hidden
* → /user/*username*/saved
* → /user/*username*/gilded

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| context | an integer between 2 and 10 |
| show | one of (`given`) |
| sort | one of (`hot`, `new`, `top`, `controversial`) |
| t | one of (`hour`, `day`, `week`, `month`, `year`, `all`) |
| type | one of (`links`, `comments`) |
| username | the name of an existing user |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| sr\_detail | (optional) expand subreddits |

## widgets

[#](#POST_api_widget)

### POST [/r/*subreddit*]/api/widget[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Add and return a widget to the specified subreddit

Accepts a JSON payload representing the widget data to be saved.
Valid payloads differ in shape based on the "kind" attribute passed on
the root object, which must be a valid widget kind.

|  |  |
| --- | --- |
| json | json data:   ``` {   "data": [     {       "height": an integer,       "linkUrl": A valid URL (optional),       "url": a valid URL of a reddit-hosted image,       "width": an integer,     },     ...   ],   "kind": one of (`image`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "configuration": {     "numEvents": an integer between 1 and 50 (default: 10),     "showDate": boolean value,     "showDescription": boolean value,     "showLocation": boolean value,     "showTime": boolean value,     "showTitle": boolean value,   },   "googleCalendarId": a valid email address,   "kind": one of (`calendar`),   "requiresSync": boolean value,   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "kind": one of (`textarea`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   },   "text": raw markdown text, }  OR  {   "data": [     {       "text": a string no longer than 20 characters,       "url": a valid URL,     }      OR      {       "children": [         {           "text": a string no longer than 20 characters,           "url": a valid URL,         },         ...       ],       "text": a string no longer than 20 characters,     },     ...   ],   "kind": one of (`menu`),   "showWiki": boolean value, }  OR  {   "buttons": [     {       "color": a 6-digit rgb hex color, e.g. `#AABBCC`,       "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       "hoverState": {         "color": a 6-digit rgb hex color, e.g. `#AABBCC`,         "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,         "kind": one of (`text`),         "text": a string no longer than 30 characters,         "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       }        OR        {         "height": an integer,         "imageUrl": a valid URL of a reddit-hosted image,         "kind": one of (`image`),         "width": an integer,       },       "kind": one of (`text`),       "text": a string no longer than 30 characters,       "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       "url": a valid URL,     }      OR      {       "height": an integer,       "hoverState": {         "color": a 6-digit rgb hex color, e.g. `#AABBCC`,         "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,         "kind": one of (`text`),         "text": a string no longer than 30 characters,         "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       }        OR        {         "height": an integer,         "imageUrl": a valid URL of a reddit-hosted image,         "kind": one of (`image`),         "width": an integer,       },       "imageUrl": a valid URL of a reddit-hosted image,       "kind": one of (`image`),       "linkUrl": a valid URL,       "text": a string no longer than 30 characters,       "width": an integer,     },     ...   ],   "description": raw markdown text,   "kind": one of (`button`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "data": [     subreddit name,     ...   ],   "kind": one of (`community-list`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "css": a string no longer than 100000 characters,   "height": an integer between 50 and 500,   "imageData": [     {       "height": an integer,       "name": a string no longer than 20 characters,       "url": a valid URL of a reddit-hosted image,       "width": an integer,     },     ...   ],   "kind": one of (`custom`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   },   "text": raw markdown text, }  OR  {   "display": one of (`cloud`, `list`),   "kind": one of (`post-flair`),   "order": [     a flair template ID,     ...   ],   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  ``` |

[#](#DELETE_api_widget_{widget_id})

### DELETE [/r/*subreddit*]/api/widget/*widget\_id*[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Delete a widget from the specified subreddit (if it exists)

|  |  |
| --- | --- |
| widget\_id | id of an existing widget |

[#](#PUT_api_widget_{widget_id})

### PUT [/r/*subreddit*]/api/widget/*widget\_id*[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Update and return the data of a widget.

Accepts a JSON payload representing the widget data to be saved.
Valid payloads differ in shape based on the "kind" attribute passed on
the root object, which must be a valid widget kind.

|  |  |
| --- | --- |
| json | json data:   ``` {   "data": [     {       "height": an integer,       "linkUrl": A valid URL (optional),       "url": a valid URL of a reddit-hosted image,       "width": an integer,     },     ...   ],   "kind": one of (`image`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "configuration": {     "numEvents": an integer between 1 and 50 (default: 10),     "showDate": boolean value,     "showDescription": boolean value,     "showLocation": boolean value,     "showTime": boolean value,     "showTitle": boolean value,   },   "googleCalendarId": a valid email address,   "kind": one of (`calendar`),   "requiresSync": boolean value,   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "kind": one of (`textarea`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   },   "text": raw markdown text, }  OR  {   "display": one of (`full`, `compact`),   "kind": one of (`subreddit-rules`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "data": [     {       "text": a string no longer than 20 characters,       "url": a valid URL,     }      OR      {       "children": [         {           "text": a string no longer than 20 characters,           "url": a valid URL,         },         ...       ],       "text": a string no longer than 20 characters,     },     ...   ],   "kind": one of (`menu`),   "showWiki": boolean value, }  OR  {   "buttons": [     {       "color": a 6-digit rgb hex color, e.g. `#AABBCC`,       "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       "hoverState": {         "color": a 6-digit rgb hex color, e.g. `#AABBCC`,         "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,         "kind": one of (`text`),         "text": a string no longer than 30 characters,         "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       }        OR        {         "height": an integer,         "imageUrl": a valid URL of a reddit-hosted image,         "kind": one of (`image`),         "width": an integer,       },       "kind": one of (`text`),       "text": a string no longer than 30 characters,       "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       "url": a valid URL,     }      OR      {       "height": an integer,       "hoverState": {         "color": a 6-digit rgb hex color, e.g. `#AABBCC`,         "fillColor": a 6-digit rgb hex color, e.g. `#AABBCC`,         "kind": one of (`text`),         "text": a string no longer than 30 characters,         "textColor": a 6-digit rgb hex color, e.g. `#AABBCC`,       }        OR        {         "height": an integer,         "imageUrl": a valid URL of a reddit-hosted image,         "kind": one of (`image`),         "width": an integer,       },       "imageUrl": a valid URL of a reddit-hosted image,       "kind": one of (`image`),       "linkUrl": a valid URL,       "text": a string no longer than 30 characters,       "width": an integer,     },     ...   ],   "description": raw markdown text,   "kind": one of (`button`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "currentlyViewingText": a string no longer than 30 characters,   "kind": one of (`id-card`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   },   "subscribersText": a string no longer than 30 characters, }  OR  {   "data": [     subreddit name,     ...   ],   "kind": one of (`community-list`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "css": a string no longer than 100000 characters,   "height": an integer between 50 and 500,   "imageData": [     {       "height": an integer,       "name": a string no longer than 20 characters,       "url": a valid URL of a reddit-hosted image,       "width": an integer,     },     ...   ],   "kind": one of (`custom`),   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   },   "text": raw markdown text, }  OR  {   "display": one of (`cloud`, `list`),   "kind": one of (`post-flair`),   "order": [     a flair template ID,     ...   ],   "shortName": a string no longer than 30 characters,   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  OR  {   "kind": one of (`moderators`),   "styles": {     "backgroundColor": a 6-digit rgb hex color, e.g. `#AABBCC`,     "headerColor": a 6-digit rgb hex color, e.g. `#AABBCC`,   }, }  ``` |
| widget\_id | a valid widget id |

[#](#POST_api_widget_image_upload_s3)

### POST [/r/*subreddit*]/api/widget\_image\_upload\_s3[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Acquire and return an upload lease to s3 temp bucket.

The return value of this function is a json object containing
credentials for uploading assets to S3 bucket, S3 url for upload
request and the key to use for uploading. Using this lease the client
will upload the emoji image to S3 temp bucket (included as part of
the S3 URL).

This lease is used by S3 to verify that the upload is authorized.

|  |  |
| --- | --- |
| filepath | name and extension of the image file e.g. image1.png |
| mimetype | mime type of the image e.g. image/png |

[#](#PATCH_api_widget_order_{section})

### PATCH [/r/*subreddit*]/api/widget\_order/*section*[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Update the order of widget\_ids in the specified subreddit

|  |  |
| --- | --- |
| json | json data:   ``` [   a string,   ... ]  ``` |
| section | one of (`sidebar`) |

[#](#GET_api_widgets)

### GET [/r/*subreddit*]/api/widgets[structuredstyles](https://github.com/reddit/reddit/wiki/OAuth2)

Return all widgets for the given subreddit

|  |  |
| --- | --- |
| progressive\_images | boolean value |

## wiki

[#](#POST_api_wiki_alloweditor_{act})

### POST [/r/*subreddit*]/api/wiki/alloweditor/*act*[modwiki](https://github.com/reddit/reddit/wiki/OAuth2)

* → [/r/*subreddit*]/api/wiki/alloweditor/del
* → [/r/*subreddit*]/api/wiki/alloweditor/add

Allow/deny `username` to edit this wiki `page`

|  |  |
| --- | --- |
| act | one of (`del`, `add`) |
| page | the name of an existing wiki page |
| uh / X-Modhash header | a [modhash](#modhashes) |
| username | the name of an existing user |

[#](#POST_api_wiki_edit)

### POST [/r/*subreddit*]/api/wiki/edit[wikiedit](https://github.com/reddit/reddit/wiki/OAuth2)

Edit a wiki `page`

|  |  |
| --- | --- |
| content |  |
| page | the name of an existing page or a new page to create |
| previous | the starting point revision for this edit |
| reason | a string up to 256 characters long, consisting of printable characters. |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_wiki_hide)

### POST [/r/*subreddit*]/api/wiki/hide[modwiki](https://github.com/reddit/reddit/wiki/OAuth2)

Toggle the public visibility of a wiki page revision

|  |  |
| --- | --- |
| page | the name of an existing wiki page |
| revision | a wiki revision ID |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#POST_api_wiki_revert)

### POST [/r/*subreddit*]/api/wiki/revert[modwiki](https://github.com/reddit/reddit/wiki/OAuth2)

Revert a wiki `page` to `revision`

|  |  |
| --- | --- |
| page | the name of an existing wiki page |
| revision | a wiki revision ID |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_wiki_discussions_{page})

### GET [/r/*subreddit*]/wiki/discussions/*page*[wikiread](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve a list of discussions about this wiki `page`

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| page | the name of an existing wiki page |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_wiki_pages)

### GET [/r/*subreddit*]/wiki/pages[wikiread](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve a list of wiki pages in this subreddit

[#](#GET_wiki_revisions)

### GET [/r/*subreddit*]/wiki/revisions[wikiread](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve a list of recently changed wiki pages in this subreddit

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_wiki_revisions_{page})

### GET [/r/*subreddit*]/wiki/revisions/*page*[wikiread](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve a list of revisions of this wiki `page`

*This endpoint is [a listing](#listings).*

|  |  |
| --- | --- |
| after | [fullname](#fullnames) of a thing |
| before | [fullname](#fullnames) of a thing |
| count | a positive integer (default: 0) |
| limit | the maximum number of items desired (default: 25, maximum: 100) |
| page | the name of an existing wiki page |
| show | (optional) the string `all` |
| sr\_detail | (optional) expand subreddits |

[#](#GET_wiki_settings_{page})

### GET [/r/*subreddit*]/wiki/settings/*page*[modwiki](https://github.com/reddit/reddit/wiki/OAuth2)

Retrieve the current permission settings for `page`

|  |  |
| --- | --- |
| page | the name of an existing wiki page |

[#](#POST_wiki_settings_{page})

### POST [/r/*subreddit*]/wiki/settings/*page*[modwiki](https://github.com/reddit/reddit/wiki/OAuth2)

Update the permissions and visibility of wiki `page`

|  |  |
| --- | --- |
| listed | boolean value |
| page | the name of an existing wiki page |
| permlevel | an integer |
| uh / X-Modhash header | a [modhash](#modhashes) |

[#](#GET_wiki_{page})

### GET [/r/*subreddit*]/wiki/*page*[wikiread](https://github.com/reddit/reddit/wiki/OAuth2)

Return the content of a wiki page

If `v` is given, show the wiki page as it was at that version
If both `v` and `v2` are given, show a diff of the two

|  |  |
| --- | --- |
| page | the name of an existing wiki page |
| v | a wiki revision ID |
| v2 | a wiki revision ID |