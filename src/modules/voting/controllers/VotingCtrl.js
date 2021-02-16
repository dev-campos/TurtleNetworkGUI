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

            /**
             *  The polling data coming from the oracle
             * @type {Object}
             */
            pollData = {};

            constructor() {
                super($scope);
                votingService.fetchPolls().then(data => {
                    this.pollData = data;
                });
            }

            $onDestroy() {
                super.$onDestroy();
            }

            getPollsAsArray() {
                return Object.keys(this.pollData).map(k => this.pollData[k]);
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

