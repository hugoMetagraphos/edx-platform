(function(define) {
    'use strict';

    define(
        [
            'jquery',
            'backbone',
            'discussion/js/discussion_router'
        ],
        function($, Backbone, DiscussionRouter) {
            return function(options) {
                var $element = options.$el,
                    userInfo = options.user_info,
                    sortPreference = options.sort_preference,
                    threads = options.threads,
                    threadPages = options.thread_pages,
                    contentInfo = options.content_info,
                    user = new window.DiscussionUser(userInfo),
                    discussion,
                    courseSettings;
                // TODO: Perhaps eliminate usage of global variables when possible
                window.DiscussionUtil.loadRolesFromContainer();
                window.$$course_id = options.courseId;
                window.courseName = options.course_name;
                window.DiscussionUtil.setUser(user);
                window.user = user;
                window.Content.loadContentInfos(contentInfo);
                discussion = new window.Discussion(threads, {pages: threadPages, sort: sortPreference});
                courseSettings = new window.DiscussionCourseSettings(options.course_settings);
                // jshint nonew:false
                new DiscussionRouter({
                    discussion: discussion,
                    course_settings: courseSettings
                });
                Backbone.history.start({
                    pushState: true,
                    root: '/courses/' + options.courseId + '/discussion/forum/'
                });
            };
        });
}).call(this, define || RequireJS.define);
