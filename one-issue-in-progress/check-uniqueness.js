/**
 * Do not allow developers to have more than 1 issue in progress per project
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var search = require('@jetbrains/youtrack-scripting-api/search');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: 'Do not allow developers to have more than 1 issue in progress per project',
  action: function(ctx) {
    var issue = ctx.issue;
    if (issue.isReported &&
      (issue.fields.becomes(ctx.State, ctx.State['In Progress']) ||
      issue.fields.isChanged(ctx.Assignee)) &&
      (issue.fields.Assignee || {}).login === ctx.currentUser.login) {
      // First, we build a search query that checks the project that the issue belongs to and returns all of the issues
      // that are assigned to current user except for this issue.
      var query = 'for: me State: {In Progress} issue id: -' + issue.id;
      var inProgress = search.search(issue.project, query, ctx.currentUser);
      // If any issues are found, we get the first one and warn the user.
      if (inProgress.isNotEmpty()) {
        var otherIssue = inProgress.first();
        var message = 'Dear ' + ctx.currentUser.login + ', please close ' + otherIssue.id + ' first!';
        workflow.check(false, message);
      }
    }
  },
  requirements: {
    State: {
      type: entities.State.fieldType,
      'In Progress': {}
    },
    Assignee: {
      type: entities.User.fieldType
    }
  }
});