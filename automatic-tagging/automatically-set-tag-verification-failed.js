/**
 * Тег "Verification Failed" проставляется задачам при переходе из состояния "To Verify" в "In Progress" или "Open"
 * Назначение скрипта: Следить за актуальностью тега "Verification Failed" (который часто забывают выставлять)
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: workflow.i18n('Set "Verification Failed" tag when issue state changes from "To Verify" to "In Progress" or "Open"'),
  guard: function(ctx) {
    var issue = ctx.issue;
    return issue.fields.isChanged(ctx.State) && issue.fields.State && !issue.fields.State.isResolved;
  },
  action: function(ctx) {
    var TARGET_TAG_NAME = 'Verification Failed';
	
    var OLD_STATE_NAME = 'To Verify';

    var STATE_OPEN = 'Open';
    var STATE_IN_PROGRESS = 'In Progress';

    var issue = ctx.issue;
    var oldValue = issue.fields.oldValue(ctx.State);

    if (issue && oldValue) {
      var oldState = oldValue.name;
      var newState = issue.fields.State.name;

      if (oldState === OLD_STATE_NAME && (newState === STATE_OPEN || newState === STATE_IN_PROGRESS)) {

        issue.addTag(TARGET_TAG_NAME);

        var wasSuccessfullyAdded = issue.tags.find(function(tag) {
          return tag.name === TARGET_TAG_NAME;
        });

        if (wasSuccessfullyAdded) {
          // Dont show timer messages (agreed with Dmitry Skryabin)
          // workflow.message(workflow.i18n('Issue tagged as "{0}"', TARGET_TAG_NAME));
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
