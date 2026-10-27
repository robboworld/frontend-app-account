/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Notification text. Known types are built from content_context with our own messages (the LMS text
 * is English only). Unknown types fall back to the LMS HTML, reduced to plain text with <strong>/<em>:
 * the LMS puts learner input (post titles, names) into that HTML without escaping, so it is never
 * injected as markup.
 */
import React from 'react';

import messages from './messages';

const TYPE_MESSAGES = {
  ora_staff_notifications: ({ grouped }) => (grouped ? messages.oraStaffGrouped : messages.oraStaff),
  ora_grade_assigned: () => messages.oraGrade,
  new_discussion_post: ({ grouped }) => (grouped ? messages.newDiscussionPostGrouped : messages.newDiscussionPost),
  new_question_post: () => messages.newQuestionPost,
  new_response: () => messages.newResponse,
  new_comment: () => messages.newComment,
  new_comment_on_response: () => messages.newCommentOnResponse,
  response_on_followed_post: () => messages.responseOnFollowedPost,
  comment_on_followed_post: () => messages.commentOnFollowedPost,
  content_reported: () => messages.contentReported,
  response_endorsed_on_thread: () => messages.responseEndorsedOnThread,
  response_endorsed: () => messages.responseEndorsed,
  learner_test_completed: () => messages.learnerTestCompleted,
  learner_all_tests_completed: () => messages.learnerAllTestsCompleted,
  learner_ora_submitted: () => messages.learnerOraSubmitted,
  learner_all_ora_submitted: () => messages.learnerAllOraSubmitted,
  learner_course_completed: () => messages.learnerCourseCompleted,
  learner_deadline_soon: () => messages.learnerDeadlineSoon,
  learner_section_released: () => messages.learnerSectionReleased,
  learner_certificate_issued: () => messages.learnerCertificateIssued,
  learner_grade_changed: () => messages.learnerGradeChanged,
  learner_added_to_course: () => messages.learnerAddedToCourse,
  learner_enrolled: () => messages.learnerEnrolled,
  learner_unenrolled: () => messages.learnerUnenrolled,
  learner_low_score: () => messages.learnerLowScore,
  learner_missed_deadline: () => messages.learnerMissedDeadline,
  learner_inactive: () => messages.learnerInactive,
  submission_review_overdue: () => messages.submissionReviewOverdue,
  course_weekly_report: () => messages.courseWeeklyReport,
  course_published_by_coauthor: () => messages.coursePublishedByCoauthor,
  course_import_export: () => messages.courseImportExport,
  added_to_course_team: () => messages.addedToCourseTeam,
};

const EMPHASIS_TAGS = new Set(['STRONG', 'B']);
const ITALIC_TAGS = new Set(['EM', 'I']);

/** LMS HTML → React nodes: text, <strong>, <em> and line breaks only. */
export const safeHtmlToNodes = (html) => {
  if (!html || typeof DOMParser === 'undefined') {
    return html || '';
  }
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  let key = 0;
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    const children = Array.from(node.childNodes).map(walk);
    key += 1;
    if (EMPHASIS_TAGS.has(node.tagName)) {
      return <strong key={key}>{children}</strong>;
    }
    if (ITALIC_TAGS.has(node.tagName)) {
      return <em key={key}>{children}</em>;
    }
    if (node.tagName === 'BR') {
      return <br key={key} />;
    }
    return <React.Fragment key={key}>{children}</React.Fragment>;
  };
  return Array.from(doc.body.childNodes).map(walk);
};

/** Plain text of LMS HTML (course update body). */
export const htmlToText = (html) => {
  if (!html || typeof DOMParser === 'undefined') {
    return html || '';
  }
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

const bold = (chunks) => <strong>{chunks}</strong>;

const notificationText = (intl, notification) => {
  const { notificationType, contentContext = {}, content } = notification;
  if (notificationType === 'course_updates') {
    const text = htmlToText(contentContext.courseUpdateContent || content);
    return intl.formatMessage(messages.courseUpdates, { content: text });
  }
  const pick = TYPE_MESSAGES[notificationType];
  if (!pick) {
    return safeHtmlToNodes(content);
  }
  return intl.formatMessage(pick(contentContext), {
    ...contentContext,
    content: htmlToText(contentContext.content),
    // learner_deadline_soon: the due moment in the reader's locale and time zone.
    dueText: contentContext.due
      ? intl.formatDate(contentContext.due, {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
      : '',
    b: bold,
  });
};

export default notificationText;
