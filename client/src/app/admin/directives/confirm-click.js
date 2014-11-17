goog.require('auth.admin');

auth.admin.module.directive('ngConfirmClick', [
  function(){
    return {
      priority: 1,
      terminal: true,
      restrict: 'A',
      link: function(scope, element, attrs){
        var msg = attrs.ngConfirmClick || "Please confirm your action?";
        var clickAction = attrs.ngClick;
        element.bind('click',function () {
          if ( window.confirm(msg) ) {
            scope.$eval(clickAction)
          }
        });
      }
    }
  }
]);