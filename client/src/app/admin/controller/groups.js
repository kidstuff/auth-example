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
			growl.addSuccessMessage('Create group "'+group.Name+'" success!');
			$state.go('admin.group-detail', {id: group.Id});
		}, function(err) {

		});
	}
}]);

auth.admin.module.controller('GroupDetailController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	$scope.group = {};

	auth.getGroup($stateParams.id, function(group) {
		$scope.group = group;
	}, function(err) {

	});

	$scope.addPrivilege = function() {
		$scope.group.Privileges.push($scope.newPrivilege);
		$scope.newPrivilege = "";
	}

	$scope.removePrivilege = function(index) {
		$scope.group.Privileges.splice(index, 1);
	}

	$scope.delete = function() {
		auth.removeGroup($scope.group.Id, function() {
			growl.addSuccessMessage('Delete group success!')
			$state.go('admin.group-list')
		}, function(err) {

		});
	}

	$scope.update = function() {
		auth.updateGroup($scope.group, function() {
			growl.addSuccessMessage('Update group success!');
		}, function(err) {

		});
	}
}]);