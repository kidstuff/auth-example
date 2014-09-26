goog.require('auth.admin');

auth.admin.module.controller('LoginController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	$scope.user = {};
	if(auth.isLoged()) {
		$state.go('dashboard');
	}

	$scope.submit = function() {
		auth.login($scope.user.Email, $scope.user.Pwd, function(data, status, headers, config) {
			$state.go('dashboard');
		}, function(data, status, headers, config) {
			growl.addErrorMessage(status);
		});
	}
}]);