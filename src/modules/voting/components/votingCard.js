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
            isEligible = true
            votes = []

            constructor() {
                super($scope);
            }

            async $onInit() {
                const height = await waves.node.height();
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
                this.isClosed = this.relativeElapsedTime >= 1;
                this.hasVotes = VotingCard._hasVotes(this.pollData);
                this.votes = VotingCard._getCurrentVotesAsNormalized(this.pollData);
            }

            static _hasVotes(polldata) {
                return Object.keys(polldata.options).some(k => polldata.options[k].votes > 0);
            }

            static _getCurrentVotesAsNormalized(pollData) {

                const Colors = [
                    '#a4ec9b',
                    '#5a81ea',
                    '#a6c1b7',
                    '#e36569',
                    '#008b55',
                    '#efa141'
                    // ... add more if needed
                ];

                const { options } = pollData;
                const mappedOptions = Object.keys(options).map(k => options[k]);
                const totalVotes = mappedOptions.reduce((acc, o) => acc + o.votes, 0);
                return mappedOptions.reduce((acc, opt, i) => {
                    const prev = acc[i - 1];
                    acc.push({
                        c: Colors[i % (Colors.length - 1)],
                        l: opt.label,
                        x: prev ? prev.x + prev.w : 0,
                        w: opt.votes / totalVotes
                    });
                    return acc;
                }, []);

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
