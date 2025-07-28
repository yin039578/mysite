Next: 盤後端, 看一下感謝祭用哪些

前端：
- Nabi
  - /classroom/apim/list
- AC
  - /account/uuid/{}
- clinic
  - /user/giverClinicStatus/{}
- docapi
  - /signature
  - /getFileDetail
  - /getFileUrl
  - /htmlConvert
- giver
  - /api/reply/list
  - /api/question/{}
  - /api/reply/{}
- heybar
  - /auth/token/apply
  - /auth/token/apply
  - crypto/encrypt
  - /crypto/encrypt/{}
- intro
  - /104-cms/v1/elementor/getPostBySlug/{}
  - /wp/v2/posts?categories={}&per_page={}&page={}&context=embed
- meet
  - /event/query/list
- me
  - /giver/search
  - /profile/list
  - /profile/list/simple
  - /profile/active_service
  - /profile/achievement/search
  - /profile/achievement/{}
  - /profile/follow
  - /profile/follow/{}/{}
  - /profile/follow/is_followed/{}/{}
  - /profile/follow/followed_list
  - /profile/follow/follower_list
  - /profile PUT
  - /profile POST
  - /profile/{} GET
  - /profile/{} DELETE
  - /service_record PUT
  - /service_record POST
  - /service_record/counts PUT
  - /service_record/{} DELETE
  - /service_record/list/page 
  - /service_record/list/all
  - /portfolio/list
  - /portfolio/{}
  - /portfolio/add
  - /portfolio/{}
  - /portfolio/{}/{}
  - /activity/list

後端
- ac
  - /account/{}
  - /account/get-multiple
  - /activation/activate
  - /activation/deactivate
  - /delete-task/service/status
- clinic
  - /api/user/giver/list 
- giver
  - /api/deleteQuestionSpecific
  - /api/deleteQuestionRecommend
  - /api/member_info/setting/list
- meet
  - /api/event/query/signup_showup_count
- my104
  - /users/{}/resumes
  - /users/{}/resumes/{}
- notify
  - /api/notice/notify
- profile
  - /api/profile/{}
  - /api/profile post
  - /api/profile put
  - /api/profile/active_service put
  - /api/profile/active_service/on_list put
  - /api/profile/follow
  - /api/profile/follow/{}/{}
  - /api/profile/join
  - /api/event/publish_result/fail
  - /api/event/publish_result/fail/by_date
  - /api/event/publish_result/fail/is_process
  - /api/profile/leave
  - /api/service_record post
  - /api/service_record put
  - /api/service_record/{}
  - /api/profile/achievement/reports/quarterly
  - /api/profile/achievement/search
  - /api/giver/counselor/batch
  - /api/giver/counselor/{}
  - /api/giver/achievement/compute/list
  - /api/profile/achievement/reports
  - /api/giver/achievement/reports/month_range
  - /api/mts/is_black/pid

apim-aws:
- giver
  - post /api/member_info/setting/list
  - get /api/reply/list
  - get /api/question/{}
  - get /api/giver/list_refer_reply
  - get /api/reply/{}
- prfile
  - post /api/profile/follow/follower_list
  - post /api/profile/achievement/reports
  - post /api/service_record/list/all
  - put /api/profile/active_service
  - get /api/profile/{}
  - put /api/service_record/counts
  - delete /api/giver/counselor/{}
  - get /api/profile/achievement/{}
  - post /api/statistics/profile/follow
  - get /api/profile/view/{}
  - post /api/event/publish_result/fail
  - delete /api/portfolio/{}/{}deprecared
  - post /api/profile/list
  - get /api/portfolio/{}deprecared
  - post /api/service_record
  - put /api/profile/status/open/{}
  - post /api/mts/is_black/pid
  - post /api/service_record/list/page
  - post /api/profile/achievement/reports/quarterly
  - post /api/portfolio/adddeprecared
  - post /api/giver/counselor/batch
  - post /api/giver/achievement/reports/month_range
  - put /api/profile
  - delete /api/profile/follow/{}/{}
  - put /api/event/publish_result/fail/is_process
  - put /api/profile/leave
  - get /api/profile/follow/is_followed/{}/{}
  - delete /api/service_record/{}
  - post /api/profile/follow/followed_list
  - post /api/event/publish_result/fail/by_date
  - post /api/portfolio/listdeprecared
  - put /api/profile/status/close/{}
  - post /api/giver/search
  - post /api/profile/follow
  - post /api/profile/achievement/search
  - post /api/activity/search
  - put /api/service_record
  - post /api/giver/achievement/compute/list
  - put /api/portfolio/{}deprecared
  - post /api/profile/achievement/reports/month
  - put /api/profile/active_service/on_list
  - post /api/profile/list/simple
  - post /api/profile/join
  - post /api/profile
- clinic
  - post /api/user/giver/list
  - get /api/user/giverClinicStatus/{}
  - get /api/user/clinic/givers/{}
  - post /api/clinic/app/mediaClinic
- intro
  - get /wp/v2/posts
  - get /104-cms/v1/elementor/getPostBySlug/{}
- n11s
  - /api/notice/notify
- heybar
  - post /api/crypto/encrypt
  - get /api/auth/token/apply
  - get /api/crypto/encrypt/{}
- mert
  - post /api/event/query/signup_showup_count
  - post /api/event/query/list
- doc
  - post /htmlConvert
  - get /getFileDetail
  - post /signature
  - post /getFileUrl
- nabi
  -  /api/classroom/apim/list
apim-idc:
- ac 不過GW
  - get /v1/account/unique-key/pid/{}
  - get /v1/account/{}
  - put /v1/delete-task/service/status
  - post /v1/account/get-multiple
  - put /v1/activation/deactivate
  - get /v1/account/uuid/{}
  - put /v1/activation/activate
  - post /v1/account/unique-key/pids
- my104
  - get /users/{}/resumes
- ac
  - get /account/{}


有申請未使用
idc:
- ac no-gw
/account/unique-key/pid/{}
/account/unique-key/pids
- ac
  - /account/{pid}
aws:
- profile
/activity/search
- clinic
/clinic/app/mediaClinic
*/user/clinic/givers/{}
- giver
*/giver/list_refer_reply
- profile
/profile/achievement/reports/month
/profile/status/close/{}
/profile/status/open/{}
/profile/view/{}
/statistics/profile/follow

前端有用未申請
/activity/list

後端使用未申請
/deleteQuestionRecommend
/deleteQuestionSpecific
/users/{}/resumes/{}