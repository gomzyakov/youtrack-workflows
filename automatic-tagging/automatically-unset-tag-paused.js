/**
 * Убираем тег "Paused" при переходе из состояния "Open" в любое другое.
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  	title: workflow.i18n('Unset "Paused" tag when issue state changes from "Open" to any other'),
  	guard: function(ctx) {
    	var issue = ctx.issue;
    	return issue.fields.isChanged(ctx.State) && issue.fields.State && !issue.fields.State.isResolved;
  	},
  	action: function(ctx) {
    	var TAG_TO_UNSET_NAME = 'Paused';
    	var OLD_STATE_NAME = 'Open';
   		
    	var issue = ctx.issue;
    	
    	var oldValue = issue.fields.oldValue(ctx.State);
    	var oldState = oldValue.name;
    
		var newState = issue.fields.State.name;
    	
      	var issueHaveTagToUnset = issue.tags.find(function(tag) {
        	return tag.name === TAG_TO_UNSET_NAME;
       	});
      
		if (oldValue && 
        	oldState === OLD_STATE_NAME && 
        	newState !== OLD_STATE_NAME &&
       		issueHaveTagToUnset) {
      
       		issue.removeTag(TAG_TO_UNSET_NAME);
          
          	workflow.message(workflow.i18n('Tag "{0}" is removed from issue', TAG_TO_UNSET_NAME));
    	}
  	},
  	requirements: {
    	State: {
    	  	type: entities.State.fieldType
    	}
  	}
});
