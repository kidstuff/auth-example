goog.require('auth.admin');

function SettingsController($scope, $state, auth, env, growl, keys) {
	$scope.settings = {};
	auth.getSettings(keys, function(settings) {
		$scope.settings = settings;
	}, function(err) {

	});

	$scope.submit = function() {
		auth.updateSettings($scope.settings, function() {
			growl.addSuccessMessage('Settings update success!');
		}, function() {

		})
	}
}

auth.admin.module.controller('SettingMainController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	var keys = ['auth_full_path', 'auth_activate_redirect', 'auth_approve_new_user'];
	SettingsController($scope, $state, auth, env, growl, keys);
}]);

auth.admin.module.controller('SettingMailController', ['$scope', '$state', 'auth', 'env', 'growl',
function($scope, $state, auth, env, growl) {
	var keys = [
		'auth_email_from',
		'auth_send_activate_email',
		'auth_activate_email_subject',
		'auth_activate_email_message',
		'auth_send_welcome_email',
		'auth_welcome_email_subject',
		'auth_welcome_email_message',
	];
	SettingsController($scope, $state, auth, env, growl, keys);
}]);