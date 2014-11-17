goog.require('auth.admin');

auth.admin.module.controller('DashboardController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

}]);

auth.admin.module.controller('AdminController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

	$scope.logout = function() {
		auth.logout();
		$state.go('login');
	}
}]);