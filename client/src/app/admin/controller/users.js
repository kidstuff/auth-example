goog.require('auth.admin');

auth.admin.module.controller('UserListController', ['$scope', '$state', 'auth', 'env', 'growl', '$http',
function($scope, $state, auth, env, growl, $http) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

	$scope.users = [];

	auth.listUser({}, function(users) {
		$scope.users = users;
	}, function(err){

	});
}]);

auth.admin.module.controller('UserDetailController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	if(!auth.isLoged()) {
		$state.go('login');
	}

	$scope.user = {};

	auth.getUser($stateParams.id, function(user) {
		$scope.user = user;
	}, function(err) {

	});

	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.submit = function() {
		if(typeof $scope.user.Profile.JoinDay == 'string') {
			$scope.user.Profile.JoinDay = moment($scope.user.Profile.JoinDay).format();
		}
		auth.updateUserProfile($scope.user.Id, $scope.user.Profile, function() {
		}, function(err) {

		});
	}
}]);