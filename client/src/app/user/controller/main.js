goog.require('auth.user');

auth.user.module.controller('UserController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

}]);

auth.user.module.controller('UserDashboardController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

}]);