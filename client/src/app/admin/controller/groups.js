goog.require('auth.admin');

auth.admin.module.controller('GroupListController', ['$scope', '$state', 'auth', 'env', 'growl', '$http',
function($scope, $state, auth, env, growl, $http) {
	$scope.groups = [];

	auth.listGroup({}, function(groups) {
		$scope.groups = groups;
	}, function(err){

	});
}]);

auth.admin.module.controller('GroupCreateController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	$scope.group = {Privileges:[]};

	$scope.addPrivilege = function() {
		$scope.group.Privileges.push($scope.newPrivilege);
		$scope.newPrivilege = "";
	}

	$scope.removePrivilege = function(index) {
		$scope.group.Privileges.splice(index, 1);
	}

	$scope.submit = function() {
		auth.createGroup($scope.group, function(group) {
			console.log(group);
		}, function(err) {

		});
	}
}]);