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
    	var OPEN_STATE = 'Open';
      	var IN_PROGRESS_STATE = 'In Progress';
   		
    	var issue = ctx.issue;
    	
    	var oldValue = issue.fields.oldValue(ctx.State);
    	var oldState = oldValue.name;
    
		var newState = issue.fields.State.name;
    	
      	var issueHaveTagToUnset = issue.tags.find(function(tag) {
        	return tag.name === TAG_TO_UNSET_NAME;
       	});
      
		if (oldValue && (oldState === OPEN_STATE || oldState === IN_PROGRESS_STATE) && issueHaveTagToUnset) {
      		if (newState == 'To Verify' || newState === 'Done') {
            	issue.removeTag(TAG_TO_UNSET_NAME);    
              
                workflow.message(workflow.i18n('Tag "{0}" is removed from issue', TAG_TO_UNSET_NAME));
            }
    	}
  	},
  	requirements: {
    	State: {
      		type: entities.State.fieldType
    	}
  	}
});
