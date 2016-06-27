(function(define) {
    'use strict';

    define(
        [
            'backbone',
            'common/js/discussion/utils',
            'common/js/discussion/views/discussion_thread_list_view',
            'common/js/discussion/views/discussion_thread_view',
            'common/js/discussion/views/new_post_view'
        ],
        function(Backbone, DiscussionUtil, DiscussionThreadListView, DiscussionThreadView, NewPostView) {
            var DiscussionRouter = Backbone.Router.extend({
                routes: {
                    '': 'allThreads',
                    ':forum_name/threads/:thread_id': 'showThread'
                },

                initialize: function(options) {
                    var self = this;
                    this.discussion = options.discussion;
                    this.course_settings = options.course_settings;
                    this.nav = new DiscussionThreadListView({
                        collection: this.discussion,
                        el: $('.forum-nav'),
                        courseSettings: this.course_settings
                    });
                    this.nav.on('thread:selected', this.navigateToThread);
                    this.nav.on('thread:removed', this.navigateToAllThreads);
                    this.nav.on('threads:rendered', this.setActiveThread);
                    this.nav.on('thread:created', this.navigateToThread);
                    this.nav.render();
                    this.newPost = $('.new-post-article');
                    this.newPostView = new NewPostView({
                        el: this.newPost,
                        collection: this.discussion,
                        course_settings: this.course_settings,
                        mode: 'tab'
                    });
                    this.newPostView.render();
                    this.listenTo(this.newPostView, 'newPost:cancel', this.hideNewPost);
                    $('.new-post-btn').bind('click', this.showNewPost);
                    return $('.new-post-btn').bind('keydown', function(event) {
                        return DiscussionUtil.activateOnSpace(event, self.showNewPost);
                    });
                },

                allThreads: function() {
                    this.nav.updateSidebar();
                    return this.nav.goHome();
                },

                setActiveThread: function() {
                    if (this.thread) {
                        return this.nav.setActiveThread(this.thread.get('id'));
                    } else {
                        return this.nav.goHome;
                    }
                },

                showThread: function(forumName, threadId) {
                    this.thread = this.discussion.get(threadId);
                    this.thread.set('unread_comments_count', 0);
                    this.thread.set('read', true);
                    this.setActiveThread();
                    return this.showMain();
                },

                showMain: function() {
                    var self = this;
                    if (this.main) {
                        this.main.cleanup();
                        this.main.undelegateEvents();
                    }
                    if (!($('.forum-content').is(':visible'))) {
                        $('.forum-content').fadeIn();
                    }
                    if (this.newPost.is(':visible')) {
                        this.newPost.fadeOut();
                    }
                    this.main = new DiscussionThreadView({
                        el: $('.forum-content'),
                        model: this.thread,
                        mode: 'tab',
                        course_settings: this.course_settings
                    });
                    this.main.render();
                    this.main.on('thread:responses:rendered', function() {
                        return self.nav.updateSidebar();
                    });
                    return this.thread.on('thread:thread_type_updated', this.showMain);
                },

                navigateToThread: function(threadId) {
                    var thread;
                    thread = this.discussion.get(threadId);
                    return this.navigate('' + (thread.get('commentable_id')) + '/threads/' + threadId, {
                        trigger: true
                    });
                },

                navigateToAllThreads: function() {
                    return this.navigate('', {
                        trigger: true
                    });
                },

                showNewPost: function() {
                    var self = this;
                    return $('.forum-content').fadeOut({
                        duration: 200,
                        complete: function() {
                            return self.newPost.fadeIn(200).focus();
                        }
                    });
                },

                hideNewPost: function() {
                    return this.newPost.fadeOut({
                        duration: 200,
                        complete: function() {
                            return $('.forum-content').fadeIn(200).find('.thread-wrapper')
                                .focus();
                        }
                    });
                }
            });

            return DiscussionRouter;
        });
}).call(this, define || RequireJS.define);
