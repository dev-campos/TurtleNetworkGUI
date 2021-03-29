(function () {
    'use strict';


    const controller = function (
        Base,
        $scope,
        waves,
        votingService,
        balanceWatcher,
        createPoll
    ) {

        const { WAVES_ID } = require('@turtlenetwork/signature-adapter');

        class VotingCtrl extends Base {

            /**
             *  The polling data coming from the oracle
             * @type {Object}
             */
            activePolls = {};
            closedPolls = {};
            currentHeight = 0;
            balance = 0;

            constructor() {
                super($scope);
            }

            $onInit() {
                this._updatePolls();
                createPoll(this, this._updatePolls, () => null, 10 * 1000);
            }

            async _updatePolls() {
                const [height, polls] = await Promise.all([
                    waves.node.height(),
                    votingService.fetchPolls()
                ]);
                const pollArray = Object.keys(polls).map(k => polls[k]);
                this.currentHeight = height;
                this.activePolls = pollArray.filter(p => p.end > height);
                this.closedPolls = pollArray.filter(p => p.end <= height);
                $scope.$digest();
            }

            _updateBalance() {
                this.balance = balanceWatcher.getBalance()[WAVES_ID];
            }

        }

        return new VotingCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'waves',
        'votingService',
        'balanceWatcher',
        'createPoll'
    ];

    angular.module('app.voting')
        .controller('VotingCtrl', controller);
})();

