/**
 * Убираем тег "Verification Failed" при переходе из состояния "Open" или "In Progress" в любое другое.
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: workflow.i18n('Unset "Verification Failed" tag when issue state changes from "Open" or "In Progress" to any other'),
  guard: function(ctx) {
    var issue = ctx.issue;
    return issue.fields.isChanged(ctx.State) && issue.fields.State && !issue.fields.State.isResolved;
  },
  action: function(ctx) {
    var TAG_TO_UNSET_NAME = 'Verification Failed';
    
    var STATE_OPEN = 'Open';
    var STATE_IN_PROGRESS = 'In Progress';
    var STATE_TO_VERIFY = 'To Verify';
    var STATE_DONE = 'Done';

    var issue = ctx.issue;
    var oldValue = issue.fields.oldValue(ctx.State);

    if (issue && oldValue) {
      var oldState = oldValue.name;
      var newState = issue.fields.State.name;

      var issueHaveTagToUnset = issue.tags.find(function(tag) {
        return tag.name === TAG_TO_UNSET_NAME;
      });

      if (issueHaveTagToUnset && (oldState === STATE_OPEN || oldState === STATE_IN_PROGRESS)) {
        if (newState == STATE_TO_VERIFY || newState === STATE_DONE) {
          issue.removeTag(TAG_TO_UNSET_NAME);    

          // Dont show timer messages (agreed with Dmitry Skryabin)
          // workflow.message(workflow.i18n('Tag "{0}" is removed from issue', TAG_TO_UNSET_NAME));
        }
      }
    }
  },
  requirements: {
    State: {
      type: entities.State.fieldType
    }
  }
});
