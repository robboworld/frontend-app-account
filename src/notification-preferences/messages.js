import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationHeading: {
    id: 'notification.preference.heading',
    defaultMessage: 'Notifications',
    description: 'Notification title',
  },
  notificationAppTitle: {
    id: 'notification.preference.app.title',
    defaultMessage: `{
      key, select,
      discussion {Discussions}
      coursework {Course Work}
      updates {Updates}
      grading {Grading}
      learner_progress {Learner progress}
      learning {Learning}
      authoring {Studio}
      other {{key}}
    }`,
    description: 'Display text for Notification Types',
  },
  notificationTitle: {
    id: 'notification.preference.title',
    defaultMessage: `{
      text, select,
      core {Activity notifications}
      newDiscussionPost {New discussion posts}
      newQuestionPost {New question posts}
      contentReported {Reported content}
      courseUpdates {Course updates}
      oraStaffNotifications {New ORA submission for staff grading}
      oraGradeAssigned {Essay assignment grade received}
      learnerTestCompleted {A learner completed a test}
      learnerAllTestsCompleted {A learner completed all tests}
      learnerOraSubmitted {A learner submitted an open response assignment}
      learnerAllOraSubmitted {A learner submitted all open response assignments}
      learnerCourseCompleted {A learner completed all tests and open response assignments}
      learnerDeadlineSoon {A deadline is near}
      learnerSectionReleased {A new section is open}
      learnerCertificateIssued {Certificate issued}
      learnerGradeChanged {The course team changed my grade}
      learnerAddedToCourse {I was enrolled in a course}
      learnerEnrolled {A learner enrolled}
      learnerUnenrolled {A learner left the course}
      learnerLowScore {Low score on a test}
      learnerMissedDeadline {A learner missed a deadline}
      learnerInactive {A learner is inactive}
      submissionReviewOverdue {An answer waits for review too long}
      courseWeeklyReport {Weekly course report}
      coursePublishedByCoauthor {A co-author published changes}
      courseImportExport {Course import or export finished}
      addedToCourseTeam {I was added to a course team}
      other {{text}}
    }`,
    description: 'Display text for Notification Types',
  },
  notificationChannel: {
    id: 'notification.preference.channel',
    defaultMessage: `{
      text, select,
      web {Web}
      email {Email}
      push {Push}
      other {{text}}
    }`,
    description: 'Display text for Notification Channel',
  },
  emailCadence: {
    id: 'notification.preference.emailCadence',
    defaultMessage: `{
      text, select,
      Daily {Daily}
      Weekly {Weekly}
      Immediately {Immediately}
      other {{text}}
    }`,
    description: 'Display text for Email Cadence',
  },
  typeLabel: {
    id: 'notification.preference.type.label',
    defaultMessage: 'Type',
    description: 'Display text for type',
  },
  webLabel: {
    id: 'notification.preference.web.label',
    defaultMessage: 'Web',
    description: 'Display text for web',
  },
  notificationHelpEmail: {
    id: 'notification.preference.help.email',
    defaultMessage: 'Email',
    description: 'Display text for email',
  },
  notificationHelpPush: {
    id: 'notification.preference.help.push',
    defaultMessage: 'Push',
    description: 'Display text for push',
  },
  loadMoreCourses: {
    id: 'notification.preference.load.more.courses',
    defaultMessage: 'Load more courses',
    description: 'Load more button to load more courses',
  },
  notificationPreferenceGuideLink: {
    id: 'notification.preference.guide.link',
    defaultMessage: 'as detailed here',
    description: 'Link of the notification preference for learner guide',
  },
  notificationPreferenceGuideBody: {
    id: 'notification.preference.guide.body',
    defaultMessage: 'Notifications for certain activities are enabled by default,',
    description: 'Body of the notification preferences for learner guide',
  },
  accountNotificationDescription: {
    id: 'account.notification.description',
    defaultMessage: 'Account-level settings apply to all courses. Notifications for individual courses can be changed within each course and will override account-level settings.',
    description: 'Account notification description',
  },
  notificationCadenceDescription: {
    id: 'notification.cadence.description',
    defaultMessage: 'Immediate emails arrive within a couple of minutes. The daily digest comes at {dailyTime}, the weekly one {weeklyTime}.',
    description: 'Notification cadence description',
  },
  notificationDailyTime: {
    id: 'robbo.notification.cadence.dailyTime',
    defaultMessage: '22:00 UTC',
    description: 'When the daily email digest is sent (send_email_digest Daily)',
  },
  notificationWeeklyTime: {
    id: 'robbo.notification.cadence.weeklyTime',
    defaultMessage: '22:00 UTC every Sunday',
    description: 'When the weekly email digest is sent (send_email_digest Weekly)',
  },
  notificationInfo: {
    id: 'robbo.notification.preference.info',
    defaultMessage: `{
      id, select,
      core {Replies and comments in your posts and in posts you follow, and replies marked as the answer.}
      oraStaffNotifications {A learner submitted an assignment that the course team grades.}
      learnerTestCompleted {A learner answered every problem of a graded subsection.}
      learnerOraSubmitted {A learner sent an answer to an open response assignment. Assignments graded by the course team come under «New submissions to grade».}
      learnerCourseCompleted {Sent instead of the two above when the last test or assignment closes the course.}
      learnerDeadlineSoon {Two days before the due date of a graded subsection or an assignment you have not finished.}
      learnerLowScore {A learner completed a test with less than half of the points.}
      learnerInactive {Nothing done in the course for two weeks.}
      submissionReviewOverdue {An answer graded by the course team has been waiting for three days.}
      courseWeeklyReport {Every Monday: tests completed, answers submitted and waiting, inactive learners.}
      coursePublishedByCoauthor {Not more often than once an hour per co-author.}
      other {}
    }`,
    description: 'Tooltip of a notification type (the LMS text is English only)',
  },
  notificationDefaultInfo: {
    id: 'notification.default.info',
    defaultMessage: 'Notifications for certain activities are enabled by default, as detailed here',
    description: 'Default notification info',
  },
  notificationDropdownlabel: {
    id: 'notification.dropdown.label',
    defaultMessage: 'Select notifications for',
    description: 'Dropdown label',
  },
  notificationDropdownApplies: {
    id: 'notification.dropdown.applies',
    defaultMessage: 'Applies to all courses',
    description: 'Dropdown applies to all courses',
  },
  notificationCourseDropdownApplies: {
    id: 'notification.dropdown.course.applies',
    defaultMessage: 'Overrides account-wide settings',
    description: 'Dropdown applies to specific course',
  },
  notificationMode: {
    id: 'robbo.notification.mode',
    defaultMessage: `{mode, select,
      off {Off}
      web {On site}
      email {By email}
      both {Everywhere}
      other {{mode}}
    }`,
    description: 'How a notification type is delivered',
  },
  notificationCadenceLabel: {
    id: 'robbo.notification.cadence.label',
    defaultMessage: 'Email:',
    description: 'Label of the email frequency select',
  },
  notificationTeamOnly: {
    id: 'robbo.notification.teamOnly',
    defaultMessage: 'Course team',
    description: 'Chip on notifications only the course team gets',
  },
  notificationYouAreTeam: {
    id: 'robbo.notification.youAreTeam',
    defaultMessage: 'You are on the course team',
    description: 'Chip next to a course where the user is staff, instructor or limited staff',
  },
  notificationLoading: {
    id: 'robbo.notification.loading',
    defaultMessage: 'Loading notification settings',
    description: 'Screen reader text of the settings spinner',
  },
  notificationNoCoursesTitle: {
    id: 'robbo.notification.scope.noCoursesTitle',
    defaultMessage: 'No courses yet',
    description: 'Notification settings of a user with no courses',
  },
  notificationNoCoursesBody: {
    id: 'robbo.notification.scope.noCoursesBody',
    defaultMessage: 'The settings appear here once you enroll in a course or join a course team.',
    description: 'Notification settings of a user with no courses',
  },
  notificationCourseSortLabel: {
    id: 'robbo.notification.scope.sortLabel',
    defaultMessage: 'Sort:',
    description: 'Label of the course sort select',
  },
  notificationCourseSort: {
    id: 'robbo.notification.scope.sort',
    defaultMessage: `{sort, select,
      nameAsc {By name, A–Z}
      nameDesc {By name, Z–A}
      learners {By number of learners}
      newest {Newest first}
      oldest {Oldest first}
      other {{sort}}
    }`,
    description: 'Course sort options; newest/oldest go by the course start date',
  },
  notificationCourseStart: {
    id: 'robbo.notification.scope.start',
    defaultMessage: 'Starts {date}',
    description: 'Course start date under the course name',
  },
  notificationCourseLearners: {
    id: 'robbo.notification.scope.learners',
    defaultMessage: '{count, plural, one {# learner} other {# learners}}',
    description: 'Number of learners enrolled in the course',
  },
  notificationDisableAll: {
    id: 'robbo.notification.disableAll',
    defaultMessage: 'Turn off all notifications',
    description: 'Button that switches every notification type of every course off',
  },
  notificationDisableAllTitle: {
    id: 'robbo.notification.disableAll.title',
    defaultMessage: 'Turn off all notifications?',
    description: 'Confirmation dialog title',
  },
  notificationDisableAllBody: {
    id: 'robbo.notification.disableAll.body',
    defaultMessage: 'Notifications on the site and by email stop in all your courses. You can turn any of them back on below. Courses you join later start with the default settings.',
    description: 'Confirmation dialog text',
  },
  notificationDisableAllConfirm: {
    id: 'robbo.notification.disableAll.confirm',
    defaultMessage: 'Turn off',
    description: 'Confirm button in the dialog',
  },
  notificationDisableAllCancel: {
    id: 'robbo.notification.disableAll.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the dialog',
  },
  notificationDisableAllDone: {
    id: 'robbo.notification.disableAll.done',
    defaultMessage: 'All notifications are off.',
    description: 'Status next to the button after turning everything off',
  },
  notificationResetAll: {
    id: 'robbo.notification.resetAll',
    defaultMessage: 'Reset own settings in all courses ({count})',
    description: 'Button above the course rows: every course with its own settings back to the settings for all courses',
  },
  notificationResetAllTitle: {
    id: 'robbo.notification.resetAll.title',
    defaultMessage: 'Reset own settings in all courses?',
    description: 'Confirmation dialog title',
  },
  notificationResetAllBody: {
    id: 'robbo.notification.resetAll.body',
    defaultMessage: '{count, plural, one {# course} other {# courses}} will get the settings for all courses back. Their own settings are lost.',
    description: 'Confirmation dialog text',
  },
  notificationResetAllConfirm: {
    id: 'robbo.notification.resetAll.confirm',
    defaultMessage: 'Reset',
    description: 'Confirm button in the dialog',
  },
  notificationResetAllDone: {
    id: 'robbo.notification.resetAll.done',
    defaultMessage: 'Own settings reset in {count, plural, one {# course} other {# courses}}.',
    description: 'Status after the reset',
  },
  notificationResetAllBusy: {
    id: 'robbo.notification.resetAll.busy',
    defaultMessage: 'Resetting…',
    description: 'Confirm button while the settings are being reset',
  },
  notificationResetAllProgress: {
    id: 'robbo.notification.resetAll.progress',
    defaultMessage: 'Resetting settings: course {current} of {total}',
    description: 'Progress of «reset own settings in all courses» (the course being reset, of all)',
  },
  notificationDisableAllBusy: {
    id: 'robbo.notification.disableAll.busy',
    defaultMessage: 'Turning off…',
    description: 'Confirm button while all notifications are being turned off',
  },
  notificationDisableAllProgress: {
    id: 'robbo.notification.disableAll.progress',
    defaultMessage: 'Turning off notifications in all your courses. This can take a little while.',
    description: 'Progress text of «turn off all notifications»',
  },
  notificationCourseResetBusy: {
    id: 'robbo.notification.scope.resetBusy',
    defaultMessage: 'Restoring…',
    description: 'Course reset button while the settings for all courses are being put back',
  },
  notificationLearnersTitle: {
    id: 'robbo.notification.learners.title',
    defaultMessage: 'Learners you get notifications about',
    description: 'Heading of the learner choice (course team only)',
  },
  notificationLearnersHint: {
    id: 'robbo.notification.learners.hint',
    defaultMessage: 'Applies to learner progress and new submissions to grade in this course.',
    description: 'Under the heading',
  },
  notificationLearnersAll: {
    id: 'robbo.notification.learners.all',
    defaultMessage: 'All learners of the course ({count})',
    description: 'Mode: every learner',
  },
  notificationLearnersSelected: {
    id: 'robbo.notification.learners.selected',
    defaultMessage: 'Only selected ({count})',
    description: 'Mode: selected learners',
  },
  notificationLearnersNone: {
    id: 'robbo.notification.learners.none',
    defaultMessage: 'Nobody is selected yet: notifications about learners do not come.',
    description: 'Selected mode with an empty selection',
  },
  notificationLearnersSearch: {
    id: 'robbo.notification.learners.search',
    defaultMessage: 'Find a learner by name or login',
    description: 'Search field',
  },
  notificationLearnersRemove: {
    id: 'robbo.notification.learners.remove',
    defaultMessage: 'Remove {name}',
    description: 'Remove a learner from the selection',
  },
  notificationLearnersEmpty: {
    id: 'robbo.notification.learners.empty',
    defaultMessage: 'No learners found',
    description: 'Search found nobody',
  },
  notificationLearnersMore: {
    id: 'robbo.notification.learners.more',
    defaultMessage: 'Showing {shown} of {total}: refine the search to find others.',
    description: 'More learners than shown',
  },
  notificationCourseCustomized: {
    id: 'robbo.notification.dropdown.customized',
    defaultMessage: 'Own settings',
    description: 'Badge of a course whose notification settings differ from the account-wide ones',
  },
  notificationCourseAsAccount: {
    id: 'robbo.notification.scope.asAccount',
    defaultMessage: 'Same as all courses',
    description: 'Status of a course that follows the account-wide notification settings',
  },
  notificationCoursesHeading: {
    id: 'robbo.notification.scope.coursesHeading',
    defaultMessage: 'Individual courses',
    description: 'Heading above the course rows in the notification settings',
  },
  notificationCoursesHint: {
    id: 'robbo.notification.scope.coursesHint',
    defaultMessage: 'Open a course to change its notifications. They replace the settings above only in that course.',
    description: 'Hint above the course rows',
  },
  notificationCourseSearch: {
    id: 'robbo.notification.scope.search',
    defaultMessage: 'Find a course',
    description: 'Search field above the course rows',
  },
  notificationCourseSearchEmpty: {
    id: 'robbo.notification.scope.searchEmpty',
    defaultMessage: 'No courses found',
    description: 'No course matches the search',
  },
  notificationCourseResetHint: {
    id: 'robbo.notification.scope.resetHint',
    defaultMessage: 'This course has its own settings.',
    description: 'Text next to the reset button of a course with its own settings',
  },
  notificationCourseReset: {
    id: 'robbo.notification.scope.reset',
    defaultMessage: 'Use the settings for all courses',
    description: 'Puts the account-wide notification settings back into the course',
  },
  notificationAccountScopeName: {
    id: 'notification.dropdown.accountScopeName',
    defaultMessage: 'Account',
    description: 'Label for account-wide notification scope in the course dropdown',
  },
});

export default messages;
