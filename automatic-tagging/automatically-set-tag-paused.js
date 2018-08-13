/**
 * Тег "Paused" проставляется только при переходе из состояния "In Progress" в "Open"
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: workflow.i18n('Set "Paused" tag when issue state changes from "In Progress" to "Open"'),
  guard: function(ctx) {
    var issue = ctx.issue;
    return issue.fields.isChanged(ctx.State) && issue.fields.State && !issue.fields.State.isResolved;
  },
  action: function(ctx) {
    var PAUSED_TAG_NAME = 'Paused';
    var VERIFICATION_FAILED_TAG_NAME = 'Verification Failed';
    var OLD_STATE_NAME = 'In Progress';
    var NEW_STATE_NAME = 'Open';

    var issue = ctx.issue;
    var oldValue = issue.fields.oldValue(ctx.State);

    if (issue && oldValue) {
      var oldState = oldValue.name;
      var newState = issue.fields.State.name;

      if (oldState === OLD_STATE_NAME && newState === NEW_STATE_NAME) {
        var issueHaveTagVF = issue.tags.find(function(tag) {
          return tag.name === VERIFICATION_FAILED_TAG_NAME;
        });

        // Dont attach "Paused" and "Verification Failed" at once
        if (!issueHaveTagVF) {
          issue.addTag(PAUSED_TAG_NAME);
        }

        // Dont show timer messages (agreed with Dmitry Skryabin)
        // workflow.message(workflow.i18n('Issue tagged as "{0}"', PAUSED_TAG_NAME));
      }
    }
  },
  requirements: {
    State: {
      type: entities.State.fieldType
    }
  }
});
