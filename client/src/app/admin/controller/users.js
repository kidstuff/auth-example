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
		if(typeof $scope.user.Profile.JoinDay == 'string') {
			$scope.user.Profile.JoinDay = moment($scope.user.Profile.JoinDay).format();
		}
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
		$scope.user.Groups.splice(index, 1);
	}

	$scope.addGroup = function() {
		if(typeof $scope.selectedGroup == 'undefined') {
			return;
		}
		
		for(i=0;i<$scope.user.Groups.length;i++){
			if($scope.user.Groups[i].Id == $scope.selectedGroup.Id) {
				return;
			}
		}

		$scope.user.Groups.push($scope.selectedGroup);
	}

	$scope.groups = [];
	auth.listGroup({}, function(groups){
		$scope.groups = groups;
	}, function(err){

	});
}]);

auth.admin.module.controller('UserProfileController', ['$scope', '$state', 'auth', 'env', 'growl',
'$stateParams', '$http',
function($scope, $state, auth, env, growl, $stateParams, $http) {
	UserBaseController($scope, $state, auth, env, growl, $stateParams, $http);
}]);