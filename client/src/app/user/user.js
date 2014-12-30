goog.provide('auth.user');

auth.user.module = angular.module('auth.user', ['auth', 'ui.router', 'ui.bootstrap', 'angular-growl', 'kidstuff.auth']);

auth.user.module.config(['$stateProvider', '$urlRouterProvider', 'growlProvider', 'envProvider', 'authProvider',
'$locationProvider',
function($stateProvider, $urlRouterProvider, growlProvider, envProvider, authProvider, $locationProvider) {

	$stateProvider.state('user-login', { // login doesnot use the shared 'layout.html'
		url: '/user/login',
		templateUrl: '/partials/user/login.html',
		controller: 'LoginController'
	}).state('facebook-login', { // login doesnot use the shared 'layout.html'
		url: '/user/fblogin',
		controller: 'FacebookLoginController'
	}).state('user', {
		url: '/user',
		templateUrl: '/partials/user/layout.html',
		controller: 'UserController'
	}).state('user.dashboard', {
		url: '/dashboard',
		templateUrl: '/partials/user/dashboard.html',
		controller: 'UserDashboardController'
	});

	growlProvider.globalTimeToLive(5000);

	authProvider.setEndPoint(envProvider.getAPIURL()+'/auth');
	envProvider.set('fbAppID', '862803043742165');
	$locationProvider.html5Mode(true).hashPrefix('!');
}]);