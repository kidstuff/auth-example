goog.require('auth.admin');

auth.admin.module.controller('UserListController', ['$scope', '$state', 'auth', 'env', 'growl', '$http',
function($scope, $state, auth, env, growl, $http) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

	$scope.users = [];

	$http.get(env.apiURL()+'/auth/users', {
		params:{}
	}).
	success(function(data, status, headers, config) {
		$scope.users = data.User;
	}).
	error(function(data, status, headers, config) {

	});
}]);