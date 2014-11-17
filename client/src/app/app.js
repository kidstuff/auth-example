goog.provide('auth');

goog.require('auth.admin');

auth.module = angular.module('auth', ['LocalStorageModule']);

auth.module.factory('env', function() {
	var env = {};
	env.apiURL = function() {
		if (window.location.host.indexOf('localhost') > -1) {
			return 'http://localhost:8080';
		} else {
			return window.location.origin;
		}
	}

	env.wwwURL = function() {
		if (window.location.host.indexOf('localhost') > -1) {
			return 'http://localhost:8081';
		} else {
			return  window.location.origin;
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

	auth.getUser = function(id, success, error) {
		$http.get(env.apiURL()+'/auth/users/'+id, {
			params:{}
		}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success(data);
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.updateUserProfile = function(id, profile, success, error) {
		if(typeof profile != 'undefined'){
			$http({method: 'PATCH', url: env.apiURL()+'/auth/users/'+id+'/profile', data: profile}).
			success(function(data, status, headers, config) {
				if(typeof success == 'function') {
					success();
				}
			}).
			error(function(data, status, headers, config) {
				if(typeof error == 'function') {
					error(data);
				}
			});
		}
	}

	auth.updateUserApproval = function(id, approve, success, error) {
		if(typeof approve == 'boolean'){
			$http({method: 'PUT', url: env.apiURL()+'/auth/users/'+id+'/approve', data: {Approved: approve}}).
			success(function(data, status, headers, config) {
				if(typeof success == 'function') {
					success();
				}
			}).
			error(function(data, status, headers, config) {
				if(typeof error == 'function') {
					error(data);
				}
			});
		}
	}

	auth.listUser = function(params, success, error) {
		$http.get(env.apiURL()+'/auth/users', {
			params:params
		}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success(data.Users);
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.removeUserGroup = function(userId, groupId, success, error) {
		$http({method: 'DELETE', url: env.apiURL()+'/auth/users/'+userId+'/groups/'+groupId}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success();
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.addUserGroup = function(userId, groupId, success, error) {
		$http({method: 'PUT', url: env.apiURL()+'/auth/users/'+userId+'/groups', data:{Id: groupId}}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success();
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.listGroup = function(params, success, error) {
		$http.get(env.apiURL()+'/auth/groups', {
			params:params
		}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success(data.Groups);
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.createGroup = function(group, success, error) {
		$http.post(env.apiURL()+'/auth/groups', group).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success(data);
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.createUser = function(userInfo, success, error) {
		$http.post(env.apiURL()+'/auth/users', userInfo).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success(data);
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
	}

	auth.removeUser = function(userId, success, error) {
		$http({method: 'DELETE', url: env.apiURL()+'/auth/users/'+userId}).
		success(function(data, status, headers, config) {
			if(typeof success == 'function') {
				success();
			}
		}).
		error(function(data, status, headers, config) {
			if(typeof error == 'function') {
				error(data);
			}
		});
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