/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Notifications page copy. Russian lives in src/i18n/robbo-overrides/ru.json.
 * Texts of notification types are built here from content_context: the LMS renders them
 * in English only (base_notification.py templates have no Russian catalog).
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'robbo.notifications.page.title',
    defaultMessage: 'Notifications',
    description: 'Notifications page heading',
  },
  documentTitle: {
    id: 'robbo.notifications.page.documentTitle',
    defaultMessage: 'Notifications | {siteName}',
    description: 'Browser tab title of the notifications page',
  },
  pageDescription: {
    id: 'robbo.notifications.page.description',
    defaultMessage: 'Course updates, graded assignments and replies in discussions. Notifications are kept for {days} days.',
    description: 'Notifications page subtitle',
  },
  settingsLink: {
    id: 'robbo.notifications.page.settingsLink',
    defaultMessage: 'Notification settings',
    description: 'Link from the notifications page to the notification settings',
  },
  markAllRead: {
    id: 'robbo.notifications.page.markAllRead',
    defaultMessage: 'Mark all as read',
    description: 'Button that marks every notification in the current filter as read',
  },
  filterAria: {
    id: 'robbo.notifications.filter.aria',
    defaultMessage: 'Show notifications',
    description: 'Accessible name of the notification filter group',
  },
  filterName: {
    id: 'robbo.notifications.filter.name',
    defaultMessage: `{app, select,
      all {All}
      updates {Course updates}
      grading {Assignments}
      discussion {Discussions}
      learner_progress {Learner progress}
      learning {Learning}
      authoring {Studio}
      other {{app}}
    }`,
    description: 'Notification filter (app) name',
  },
  filterNewCount: {
    id: 'robbo.notifications.filter.newCount',
    defaultMessage: '{count} new',
    description: 'Accessible text of the unseen badge on a filter',
  },
  today: {
    id: 'robbo.notifications.group.today',
    defaultMessage: 'Today',
    description: 'Date group heading',
  },
  yesterday: {
    id: 'robbo.notifications.group.yesterday',
    defaultMessage: 'Yesterday',
    description: 'Date group heading',
  },
  unread: {
    id: 'robbo.notifications.item.unread',
    defaultMessage: 'Unread',
    description: 'Accessible text of the unread marker',
  },
  loading: {
    id: 'robbo.notifications.loading',
    defaultMessage: 'Loading notifications',
    description: 'Screen reader text of the loading spinner',
  },
  loadMore: {
    id: 'robbo.notifications.loadMore',
    defaultMessage: 'Show more',
    description: 'Loads the next page of notifications',
  },
  emptyTitle: {
    id: 'robbo.notifications.empty.title',
    defaultMessage: 'No notifications yet',
    description: 'Empty notifications list heading',
  },
  emptyBody: {
    id: 'robbo.notifications.empty.body',
    defaultMessage: 'Course updates, graded assignments and replies in discussions will appear here.',
    description: 'Empty notifications list text',
  },
  emptyFilterTitle: {
    id: 'robbo.notifications.empty.filterTitle',
    defaultMessage: 'Nothing in this section',
    description: 'Empty list heading when a filter is selected',
  },
  disabledTitle: {
    id: 'robbo.notifications.disabled.title',
    defaultMessage: 'Notifications are not available yet',
    description: 'Heading when notifications are off for all of the user courses',
  },
  disabledBody: {
    id: 'robbo.notifications.disabled.body',
    defaultMessage: 'They will appear here once they are turned on for your courses.',
    description: 'Text when notifications are off for all of the user courses',
  },
  openAll: {
    id: 'robbo.notifications.settings.openAll',
    defaultMessage: 'All notifications',
    description: 'Link from the notification settings to the notifications page',
  },
  openAllNew: {
    id: 'robbo.notifications.settings.openAllNew',
    defaultMessage: '{count} new',
    description: 'Unseen badge on the link to the notifications page',
  },
  typeLabel: {
    id: 'robbo.notifications.type.label',
    defaultMessage: `{type, select,
      course_updates {Course update}
      ora_staff_notifications {Assignment to grade}
      ora_grade_assigned {Assignment graded}
      content_reported {Report}
      learner_progress {Learner progress}
      learner_deadline_soon {Deadline soon}
      learner_section_released {New section}
      learner_certificate_issued {Certificate}
      learner_certificate_offer {Certificate}
      learner_grade_changed {Grade changed}
      learner_added_to_course {Enrollment}
      learner_enrolled {New learner}
      learner_unenrolled {A learner left}
      learner_low_score {Low score}
      learner_missed_deadline {Missed deadline}
      learner_inactive {No activity}
      submission_review_overdue {Waiting for review}
      course_weekly_report {Weekly report}
      course_published_by_coauthor {Studio}
      course_import_export {Studio}
      added_to_course_team {Course team}
      other {Discussion}
    }`,
    description: 'Small caption above a notification (learner_* types come as learner_progress)',
  },
  courseUpdates: {
    id: 'robbo.notifications.text.courseUpdates',
    defaultMessage: '{content}',
    description: 'Course update notification: the update text',
  },
  oraStaff: {
    id: 'robbo.notifications.text.oraStaff',
    defaultMessage: 'A new submission is waiting for review: <b>{oraName}</b>',
    description: 'Course team: a learner submitted an assignment graded by staff',
  },
  oraStaffGrouped: {
    id: 'robbo.notifications.text.oraStaffGrouped',
    defaultMessage: 'Several submissions are waiting for review: <b>{oraName}</b>',
    description: 'Course team: several submissions of one assignment (grouped)',
  },
  oraGrade: {
    id: 'robbo.notifications.text.oraGrade',
    defaultMessage: 'Your answer to <b>{oraName}</b> has been graded: {pointsEarned} out of {pointsPossible} points',
    description: 'Learner: an assignment was graded',
  },
  newDiscussionPost: {
    id: 'robbo.notifications.text.newDiscussionPost',
    defaultMessage: 'New post by <b>{username}</b>: <b>{postTitle}</b>',
    description: 'Discussions: new post',
  },
  newDiscussionPostGrouped: {
    id: 'robbo.notifications.text.newDiscussionPostGrouped',
    defaultMessage: '<b>{username}</b> and others started new discussions',
    description: 'Discussions: several new posts (grouped)',
  },
  newQuestionPost: {
    id: 'robbo.notifications.text.newQuestionPost',
    defaultMessage: 'New question by <b>{username}</b>: <b>{postTitle}</b>',
    description: 'Discussions: new question',
  },
  newResponse: {
    id: 'robbo.notifications.text.newResponse',
    defaultMessage: 'New reply by <b>{replierName}</b> to your post <b>{postTitle}</b>',
    description: 'Discussions: a reply to the user post',
  },
  newComment: {
    id: 'robbo.notifications.text.newComment',
    defaultMessage: 'New comment by <b>{replierName}</b> on the reply by <b>{authorName}</b> to your post <b>{postTitle}</b>',
    description: 'Discussions: a comment on a reply in the user post',
  },
  newCommentOnResponse: {
    id: 'robbo.notifications.text.newCommentOnResponse',
    defaultMessage: 'New comment by <b>{replierName}</b> on your reply in <b>{postTitle}</b>',
    description: 'Discussions: a comment on the user reply',
  },
  responseOnFollowedPost: {
    id: 'robbo.notifications.text.responseOnFollowedPost',
    defaultMessage: 'New reply by <b>{replierName}</b> in a post you follow: <b>{postTitle}</b>',
    description: 'Discussions: a reply in a followed post',
  },
  commentOnFollowedPost: {
    id: 'robbo.notifications.text.commentOnFollowedPost',
    defaultMessage: 'New comment by <b>{replierName}</b> on the reply by <b>{authorName}</b> in a post you follow: <b>{postTitle}</b>',
    description: 'Discussions: a comment in a followed post',
  },
  contentReported: {
    id: 'robbo.notifications.text.contentReported',
    defaultMessage: `{contentType, select,
      thread {Post}
      response {Reply}
      comment {Comment}
      other {Message}
    } by <b>{username}</b> was reported: <b>{content}</b>`,
    description: 'Discussions: content reported (course team)',
  },
  responseEndorsedOnThread: {
    id: 'robbo.notifications.text.responseEndorsedOnThread',
    defaultMessage: 'The reply by <b>{replierName}</b> was marked as the answer in your post <b>{postTitle}</b>',
    description: 'Discussions: a reply in the user post was endorsed',
  },
  learnerTestCompleted: {
    id: 'robbo.notifications.text.learnerTestCompleted',
    defaultMessage: '<b>{learnerName}</b> completed the test <b>{testName}</b>: {pointsEarned} of {pointsPossible}',
    description: 'Course team: a learner answered every problem of a graded subsection',
  },
  learnerAllTestsCompleted: {
    id: 'robbo.notifications.text.learnerAllTestsCompleted',
    defaultMessage: '<b>{learnerName}</b> completed all tests of the course ({count})',
    description: 'Course team: a learner completed every graded subsection',
  },
  learnerOraSubmitted: {
    id: 'robbo.notifications.text.learnerOraSubmitted',
    defaultMessage: '<b>{learnerName}</b> submitted <b>{oraName}</b>',
    description: 'Course team: a learner submitted an open response assignment',
  },
  learnerAllOraSubmitted: {
    id: 'robbo.notifications.text.learnerAllOraSubmitted',
    defaultMessage: '<b>{learnerName}</b> submitted all open response assignments ({count})',
    description: 'Course team: a learner submitted every open response assignment',
  },
  learnerCourseCompleted: {
    id: 'robbo.notifications.text.learnerCourseCompleted',
    defaultMessage: '<b>{learnerName}</b> completed all tests and assignments of the course',
    description: 'Course team: a learner completed every test and open response assignment',
  },
  learnerDeadlineSoon: {
    id: 'robbo.notifications.text.learnerDeadlineSoon',
    defaultMessage: 'Deadline soon: <b>{blockName}</b> — by {dueText}',
    description: 'Learner: a deadline is near',
  },
  learnerSectionReleased: {
    id: 'robbo.notifications.text.learnerSectionReleased',
    defaultMessage: 'A new section is open: <b>{sectionName}</b>',
    description: 'Learner: a section was released',
  },
  learnerCertificateIssued: {
    id: 'robbo.notifications.text.learnerCertificateIssued',
    defaultMessage: 'Your certificate for <b>{courseName}</b> is ready',
    description: 'Learner: certificate issued',
  },
  learnerCertificateOffer: {
    id: 'robbo.notifications.text.learnerCertificateOffer',
    defaultMessage: 'You passed <b>{courseName}</b>: the certificate is available for {priceDisplay}',
    description: 'Learner: passed a course whose certificate is sold; priceDisplay is like «990 ₽»',
  },
  learnerGradeChanged: {
    id: 'robbo.notifications.text.learnerGradeChanged',
    defaultMessage: 'Your grade for <b>{itemName}</b> was changed: {pointsEarned} of {pointsPossible}',
    description: 'Learner: the course team changed a grade',
  },
  learnerAddedToCourse: {
    id: 'robbo.notifications.text.learnerAddedToCourse',
    defaultMessage: 'You were enrolled in <b>{courseName}</b>',
    description: 'Learner: enrolled by the course team',
  },
  learnerEnrolled: {
    id: 'robbo.notifications.text.learnerEnrolled',
    defaultMessage: 'New learner in the course: <b>{learnerName}</b>',
    description: 'Team: a learner enrolled',
  },
  learnerUnenrolled: {
    id: 'robbo.notifications.text.learnerUnenrolled',
    defaultMessage: 'A learner left the course: <b>{learnerName}</b>',
    description: 'Team: a learner left',
  },
  learnerLowScore: {
    id: 'robbo.notifications.text.learnerLowScore',
    defaultMessage: '<b>{learnerName}</b> — low score on <b>{testName}</b>: {pointsEarned} of {pointsPossible}',
    description: 'Team: low score on a test',
  },
  learnerMissedDeadline: {
    id: 'robbo.notifications.text.learnerMissedDeadline',
    defaultMessage: '<b>{learnerName}</b> — the deadline for <b>{blockName}</b> has passed, not submitted',
    description: 'Team: a learner missed a deadline',
  },
  learnerInactive: {
    id: 'robbo.notifications.text.learnerInactive',
    defaultMessage: '<b>{learnerName}</b> — no activity in the course for {days} days',
    description: 'Team: an inactive learner',
  },
  submissionReviewOverdue: {
    id: 'robbo.notifications.text.submissionReviewOverdue',
    defaultMessage: 'The answer of <b>{learnerName}</b> to <b>{oraName}</b> has been waiting for review for {days} days',
    description: 'Team: an answer waits for review too long',
  },
  courseWeeklyReport: {
    id: 'robbo.notifications.text.courseWeeklyReport',
    defaultMessage: 'Week in <b>{courseName}</b>: {testsDone} tests completed, {oraSubmitted} answers submitted, {waitingReview} waiting for review, {inactive} inactive for two weeks',
    description: 'Team: weekly report',
  },
  coursePublishedByCoauthor: {
    id: 'robbo.notifications.text.coursePublishedByCoauthor',
    defaultMessage: 'New changes in <b>{courseName}</b> from <b>{authorName}</b>',
    description: 'Studio: a co-author published',
  },
  courseImportExport: {
    id: 'robbo.notifications.text.courseImportExport',
    defaultMessage: 'Course {operation, select, import {import} other {export}} {result, select, succeeded {finished} other {failed}}: <b>{courseName}</b>',
    description: 'Studio: import or export finished',
  },
  addedToCourseTeam: {
    id: 'robbo.notifications.text.addedToCourseTeam',
    defaultMessage: 'You were added to the team of <b>{courseName}</b>',
    description: 'Studio: added to a course team',
  },
  responseEndorsed: {
    id: 'robbo.notifications.text.responseEndorsed',
    defaultMessage: 'Your reply was marked as the answer in <b>{postTitle}</b>',
    description: 'Discussions: the user reply was endorsed',
  },
});

export default messages;
