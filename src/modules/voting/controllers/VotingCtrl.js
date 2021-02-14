(function () {
    'use strict';

    /**
     * @param {typeof Base} Base
     * @param {$rootScope.Scope} $scope
     * @param {Waves} waves
     * @param {VotingService} votingService
     */
    const controller = function (
        Base,
        $scope,
        waves,
        votingService,
    ) {

        class VotingCtrl extends Base {

            constructor() {
                super($scope);
            }

            $onDestroy() {
                // super.$onDestroy();
                // this._listeners.forEach(listener => listener());
            }

        }

        return new VotingCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'waves',
        'votingService'
    ];

    angular.module('app.voting')
        .controller('VotingCtrl', controller);
})();

