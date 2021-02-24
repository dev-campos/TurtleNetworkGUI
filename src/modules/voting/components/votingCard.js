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
            hasVotes = false
            isClosed = true

            constructor() {
                super($scope);
            }

            async $onInit() {
                const height = await waves.node.height();
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
                this.isClosed = this.relativeElapsedTime >= 1;
                this.hasVotes = VotingCard._hasVotes(this.pollData);
            }

            static _hasVotes(polldata) {
                return Object.keys(polldata.options).some(k => polldata.options[k].votes > 0);
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
