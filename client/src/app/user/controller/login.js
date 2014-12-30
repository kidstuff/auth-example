goog.require('auth.user');

auth.user.module.controller('LoginController', ['$scope', '$state', 'auth', 'env', 'growl', '$window',
function($scope, $state, auth, env, growl, $window) {
	$scope.user = {};
	if(auth.isLoged()) {
		$state.go('user.dashboard');
	}

	$scope.submit = function() {
		auth.login($scope.user.Email, $scope.user.Pwd, function(data, status, headers, config) {
			$state.go('user.dashboard');
		}, function(data, status, headers, config) {
			growl.addErrorMessage(status);
		});
	}

	$scope.fbLogin = {
		clientID: env.get('fbAppID'),
		redirectURI: $state.href('facebook-login', {}, {absolute: true})
	}
}]);

auth.user.module.controller('FacebookLoginController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http', '$location',
function($scope, $state, auth, env, growl, $stateParams, $http, $location) {
	$scope.user = {};
	if(auth.isLoged()) {
		$state.go('user.dashboard');
	}

	$scope.fbLogin = {
		clientID: env.get('fbAppID'),
		redirectURI: $state.href('facebook-login', {}, {absolute: true})
	}
	console.log($stateParams)
	var fb_uri = '/facebook_login?code='+$location.search().code+'&redirect_uri='+$scope.fbLogin.redirectURI;
	$http.get(env.apiURL()+fb_uri).
	success(function(data, status, headers, config) {
		auth.setLoged(data.AccessToken, data.ExpiredOn, data.User)
		$state.go('user.dashboard');
	}).
	error(function(data, status, headers, config) {

	});
}]);