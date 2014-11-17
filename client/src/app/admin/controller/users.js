goog.require('auth.admin');

auth.admin.module.controller('UserListController', ['$scope', '$state', 'auth', 'env', 'growl', '$http',
function($scope, $state, auth, env, growl, $http) {
	$scope.users = [];

	auth.listUser({}, function(users) {
		$scope.users = users;
	}, function(err){

	});
}]);

function UserBaseController($scope, $state, auth, env, growl, $stateParams, $http) {
	$scope.user = {};

	auth.getUser($stateParams.id, function(user) {
		$scope.user = user;
		if(typeof $scope.user.Profile == 'undefined') {
			$scope.user.Profile = {};
		}else if(typeof $scope.user.Profile.Phones == 'undefined') {
			$scope.user.Profile.Phones = [];
		}
	}, function(err) {

	});

	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.addPhone = function() {
		$scope.user.Profile.Phones.push($scope.newPhone);
		$scope.newPhone = "";
	}

	$scope.removePhone = function(index) {
		$scope.user.Profile.Phones.splice(index, 1);
	}

	$scope.submit = function() {
		auth.updateUserProfile($scope.user.Id, $scope.user.Profile, function() {
		}, function(err) {

		});
	}
}

auth.admin.module.controller('UserDetailController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	UserBaseController($scope, $state, auth, env, growl, $stateParams, $http);

	$scope.updatingApproval = false;
	$scope.updateApproval = function() {
		$scope.updatingApproval = true;
		auth.updateUserApproval($scope.user.Id, $scope.user.Approved, function(){
			$scope.updatingApproval = false;
		}, function(err) {
			$scope.updatingApproval = false;
		});
	}

	$scope.removeGroup = function(index) {
		auth.removeUserGroup($scope.user.Id, $scope.user.Groups[index].Id, function(){
			$scope.user.Groups.splice(index, 1);
		}, function(err) {

		});
	}

	$scope.selected = {};
	$scope.addGroup = function() {
		console.log($scope.selected.Group)
		if(typeof $scope.selected.Group == 'undefined') {
			return;
		}
		
		for(i=0;i<$scope.user.Groups.length;i++){
			if($scope.user.Groups[i].Id == $scope.selected.Group.Id) {
				return;
			}
		}

		auth.addUserGroup($scope.user.Id, $scope.selected.Group.Id, function(){
			$scope.user.Groups.push($scope.selected.Group);
		}, function(err) {
			
		});
	}

	$scope.groups = [];
	auth.listGroup({}, function(groups){
		$scope.groups = groups;
	}, function(err){

	});

	$scope.delete = function() {
		auth.removeUser($scope.user.Id, function(){
			growl.addSuccessMessage('Delete user success!');
			$state.go('admin.user-list');
		}, function(){

		})
	}
}]);

auth.admin.module.controller('UserProfileController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	UserBaseController($scope, $state, auth, env, growl, $stateParams, $http);
}]);

auth.admin.module.controller('UserCreateController', ['$scope', '$state', 'auth', 'env', 'growl', '$http',
function($scope, $state, auth, env, growl, $http) {
	$scope.user = {};

	$scope.submit = function() {
		auth.createUser($scope.user, function(){
			growl.addSuccessMessage('Create new user success!');
			$scope.user = {};
		}, function(){

		});
	}
}]);