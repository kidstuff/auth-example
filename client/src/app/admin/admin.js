goog.provide('auth.admin');

auth.admin.module = angular.module('auth.admin', ['auth', 'ui.router', 'ui.bootstrap', 'angular-growl']);

auth.admin.module.config(['$stateProvider', '$urlRouterProvider', 'growlProvider',
function($stateProvider, $urlRouterProvider, growlProvider) {

	$stateProvider.state('login', { // login doesnot use the shared 'layout.html'
		url: '/admin/login',
		templateUrl: 'partials/admin/login.html',
		controller: 'LoginController'
	}).state('admin', {
		url: '/admin',
		templateUrl: 'partials/admin/layout.html',
		controller: 'AdminController'
	}).state('admin.dashboard', {
		url: '/dashboard',
		templateUrl: 'partials/admin/dashboard.html',
		controller: 'DashboardController'
	}).state('admin.user-list', {
		url: '/users',
		templateUrl: 'partials/admin/users.list.html',
		controller: 'UserListController'
	}).state('admin.user-detail', {
		url: '/users/{id}',
		templateUrl: 'partials/admin/users.detail.html',
		controller: 'UserDetailController'
	}).state('admin.group-list', {
		url: '/groups',
		templateUrl: 'partials/admin/groups.list.html',
		controller: 'GroupListController'
	}).state('admin.group-create', {
		url: '/groups/create',
		templateUrl: 'partials/admin/groups.create.html',
		controller: 'GroupCreateController'
	});

	growlProvider.globalTimeToLive(5000);
}]);