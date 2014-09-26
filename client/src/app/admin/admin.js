goog.provide('auth.admin');

auth.admin.module = angular.module('auth.admin', ['auth', 'ui.router', 'ui.bootstrap', 'angular-growl']);

auth.admin.module.config(['$stateProvider', '$urlRouterProvider', 'growlProvider',
function($stateProvider, $urlRouterProvider, growlProvider) {
	$urlRouterProvider.otherwise('dashboard');

	$stateProvider.state('dashboard', {
		url: '/dashboard',
		templateUrl: 'partials/admin/dashboard.html',
		controller: 'DashboardController'
	}).state('login', {
		url: '/login',
		templateUrl: 'partials/admin/login.html',
		controller: 'LoginController'
	}).state('user-list', {
		url: '/users',
		templateUrl: 'partials/admin/users.list.html',
		controller: 'UserListController'
	});;

	growlProvider.globalTimeToLive(5000);
}]);