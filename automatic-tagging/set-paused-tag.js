/**
 * Тег "Paused" проставляется только при переходе из состояния "In Progress" в "Open"
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: workflow.i18n('Set "Paused" tag when issue state changes from "In Progress" to "Open"'),
  guard: function(ctx) {
    //
    var issue = ctx.issue;
    return issue.fields.isChanged(ctx.State) && issue.fields.State && !issue.fields.State.isResolved;
  },
  action: function(ctx) {
    var TARGET_TAG_NAME = 'Paused';
    var OLD_STATE_NAME = 'In Progress';
    var NEW_STATE_NAME = 'Open';
    
    // Тег "Paused" проставляется только при переходе из состояния "In Progress" в "Open"
    var issue = ctx.issue;
    
    var oldValue = issue.fields.oldValue(ctx.State);
    var oldState = oldValue.name;
    
    var newState = issue.fields.State.name;
    
    if (oldValue && oldState === OLD_STATE_NAME && newState === NEW_STATE_NAME) {
      
       	issue.addTag(TARGET_TAG_NAME);
      
        var wasSuccessfullyAdded = issue.tags.find(function(tag) {
        	return tag.name === TARGET_TAG_NAME;
       	});
      
       	if (wasSuccessfullyAdded) {
         	workflow.message(workflow.i18n('Tag "{0}" is set', TARGET_TAG_NAME));
       	}
    }
  },
  requirements: {
    State: {
      type: entities.State.fieldType
    }
  }
});
