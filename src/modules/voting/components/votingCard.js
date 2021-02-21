/* eslint-disable no-console */
(function () {
    'use strict';

    /**
     *
     * @param {Base} Base
     * @param {$rootScope.Scope} $scope
     * @return {VotingCard}
     */
    const controller = function (Base, $scope, waves) {

        class VotingCard extends Base {

            pollData = {}

            relativeElapsedTime = 0.0

            constructor() {
                super($scope);
            }

            async $onInit() {
                const height = await waves.node.height();
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
            }

            getCurrentVotesAsNormalized() {
                // TODO: array of votes normalized to 1.0
                return [
                    {
                        label: 'option1',
                        value: 0.34
                    },
                    {
                        label: 'option2',
                        value: 0.2
                    },
                    {
                        label: 'option3',
                        value: 0.46
                    }
                ];
            }


        }

        return new VotingCard();
    };

    controller.$inject = ['Base', '$scope', 'waves'];

    angular.module('app.voting').component('wVotingCard', {
        bindings: {
            pollData: '<'
        },
        templateUrl: 'modules/voting/components/votingCard.html',
        controller
    });
})();
