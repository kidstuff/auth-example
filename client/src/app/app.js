goog.provide('auth');

goog.require('auth.admin');

auth.module = angular.module('auth', ['LocalStorageModule']);

auth.module.factory('env', function() {
	var env = {};
	env.apiURL = function() {
		if (window.location.host.indexOf('localhost') > -1) {
			return 'http://localhost:8080';
		} else {
			return '//api.example.com';
		}
	}

	env.wwwURL = function() {
		if (window.location.host.indexOf('localhost') > -1) {
			return 'http://localhost:8081';
		} else {
			return '//www.example.com';
		}
	}

	return env;
});

auth.module.factory('auth', ['$http', 'env', 'localStorageService',
function ($http, env, localStorageService) {
	var auth = {};
	auth.isLoged = function(){
		var access_token = localStorageService.get('access_token');
		if (access_token != null){
			var expired_on = localStorageService.get('expired_on');
			if(expired_on != null){
				if(!moment(expired_on, "YYYY-MM-DDTHH:mm:ssZ").isAfter(moment())){
					auth.logout();
					return false;
				}
				return true;
			}
		}
		return false;
	}

	auth.currentUser = function(){
		var user = localStorageService.get('user');
		if (user != null){
			return user
		}		
	}

	auth.login = function(email, password, success, error) {
		$http.get(env.apiURL()+'/auth/tokens', {
			params:{
				email: email,
				password: password,
				grant_type: "password"
			}
		}).
		success(function(data, status, headers, config) {
			localStorageService.set('access_token', data.AccessToken);
			localStorageService.set('expired_on', data.ExpiredOn);
			localStorageService.set('user', data.User);
			success(data, status, headers, config);
		}).
		error(function(data, status, headers, config) {
			error(data, status, headers, config);
		});
	}

	auth.logout = function() {
		localStorageService.remove('access_token');
		localStorageService.remove('expired_on');
		localStorageService.remove('user');
	}

	return auth;
}]);

auth.module.factory('httpRequestInterceptor', ['localStorageService',
function(localStorageService) {
    return {
        request: function($config) {
        	var token = localStorageService.get('access_token');
        	if(token != null){
        		$config.headers['Authorization'] = 'Bearer ' + token;
        	}
            return $config;
        }
    };
}]);

auth.module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.interceptors.push('httpRequestInterceptor');
}]);

var app = angular.module('app', ['auth.admin']);