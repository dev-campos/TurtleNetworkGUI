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
            activePolls = {};
            closedPolls = {};
            currentHeight = 0;

            constructor() {
                super($scope);
            }

            async $onInit() {
                const [height, polls] = await Promise.all([
                    waves.node.height(),
                    votingService.fetchPolls()
                ]);
                const pollArray = Object.keys(polls).map(k => polls[k]);
                this.currentHeight = height;
                this.activePolls = pollArray.filter(p => p.end > height);
                this.closedPolls = pollArray.filter(p => p.end <= height);
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

