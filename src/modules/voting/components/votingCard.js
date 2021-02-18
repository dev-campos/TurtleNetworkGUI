/* eslint-disable no-console */
(function () {
    'use strict';

    /**
     *
     * @param {Base} Base
     * @param {$rootScope.Scope} $scope
     * @return {VotingCard}
     */
    const controller = function (Base, $scope) {

        class VotingCard extends Base {

            pollData = {}

            constructor() {
                super($scope);
            }

        }

        return new VotingCard();
    };

    controller.$inject = ['Base', '$scope'];

    angular.module('app.voting').component('wVotingCard', {
        bindings: {
            pollData: '<'
        },
        templateUrl: 'modules/voting/components/votingCard.html',
        controller
    });
})();
